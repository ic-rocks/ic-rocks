import { Actor, Certificate, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import CandidUI from "../../components/CandidUI";
import { CanistersTable } from "../../components/CanistersTable";
import NetworkGraph from "../../components/Charts/NetworkGraph";
import CodeBlock from "../../components/CodeBlock";
import { MetaTitle } from "../../components/MetaTags";
import { PrincipalNodesList } from "../../components/NodeList";
import PrincipalDetails from "../../components/PrincipalDetails";
import Search404 from "../../components/Search404";
import CandidService from "../../lib/canisters/get-candid.did";
import fetchJSON from "../../lib/fetch";
import { APIPrincipal, Canister } from "../../lib/types/API";

const didc = import("didc");

export type PrincipalType = "Canister" | "User" | "Anonymous" | "Derived" | "";

const agent = new HttpAgent({ host: "https://ic0.app" });

const PrincipalPage = () => {
  const router = useRouter();
  const { principalId, candid: candidOverride } = router.query as {
    principalId: string;
    candid?: string;
  };
  const [isValid, setIsValid] = useState(true);
  const [type, setType] = useState<PrincipalType>("");
  const [candid, setCandid] = useState("");
  const [bindings, setBindings] = useState(null);
  const [protobuf, setProtobuf] = useState("");
  const [nodes, setNodes] = useState(null);
  const [principalData, setPrincipalData] = useState<APIPrincipal>(null);
  const [canisterData, setCanisterData] = useState<Canister>(null);

  const setCandidAndBindings = (newCandid) => {
    setCandid(newCandid);
    if (newCandid) {
      didc.then((mod) => {
        const gen = mod.generate(newCandid);
        setBindings(gen);
      });
    } else {
      setBindings(null);
    }
  };

  useEffect(() => {
    if (typeof principalId !== "string" || !principalId) return;

    let newCandid = "";
    if (candidOverride) {
      try {
        newCandid = window.atob(candidOverride);
      } catch (error) {
        console.warn("invalid candid attached");
      }
    }
    setCandidAndBindings(newCandid);
    setProtobuf("");
    setNodes(null);
    setPrincipalData(null);
    setCanisterData(null);

    let principal;
    try {
      principal = Principal.fromText(principalId).toUint8Array();
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
      console.warn(error);
      return;
    }

    let type_ = "";
    switch (principal.slice(-1)[0]) {
      case 1:
        type_ = "Canister";
        break;
      case 2:
        type_ = "User";
        break;
      case 3:
        type_ = "Derived";
        break;
      case 4:
        type_ = "Anonymous";
        break;
    }
    setType(type_ as PrincipalType);

    if (type_ == "Canister") {
      // Fetch canister data
      fetchJSON(`/api/canisters/${principalId}`).then((data) => {
        if (!data) return;

        setCanisterData(data);

        /** Read from state to verify data integrity */
        const checkState = async () => {
          const pathCommon = [Buffer.from("canister"), principal];
          const pathModuleHash = pathCommon.concat(Buffer.from("module_hash"));
          const pathController = pathCommon.concat(Buffer.from("controller"));
          const agent = new HttpAgent({ host: "https://ic0.app" });
          let res;
          try {
            res = await agent.readState(principalId, {
              paths: [pathModuleHash, pathController],
            });
          } catch (error) {
            if (res) {
              console.log(res);
            }
            console.warn("read_state:", error);
            return;
          }
          const cert = new Certificate(res, agent);
          if (await cert.verify()) {
            const subnet = cert["cert"].delegation
              ? Principal.fromUint8Array(
                  cert["cert"].delegation.subnet_id
                ).toText()
              : null;
            if (subnet) {
              if (subnet !== data?.subnetId) {
                console.warn(`subnet: api=${data?.subnetId} state=${subnet}`);
              }
            } else {
              console.warn("state: no subnet");
            }
            const certController = cert.lookup(pathController);
            if (certController) {
              const controller =
                Principal.fromUint8Array(certController).toText();
              if (data && data?.controllerId !== controller) {
                console.warn(
                  `controller: api=${data?.controllerId} state=${controller}`
                );
              }
            } else {
              console.warn("state: no controller");
            }
            const moduleHash = cert.lookup(pathModuleHash)?.toString("hex");
            if (moduleHash && data?.moduleHash !== moduleHash) {
              console.warn(
                `moduleHash: api=${data?.moduleHash} state=${moduleHash}`
              );
            }
          } else {
            console.warn("state: unable to verify cert", cert);
          }
        };
        checkState();

        /** Fetch local interface file(s) */
        const fetchLocalFiles = async () => {
          if (data.name && !candidOverride) {
            fetch(`/data/interfaces/${data.name}.did`)
              .then((res) => {
                if (!res.ok) {
                  throw res.statusText;
                }
                return res.text();
              })
              .then((data) => {
                setCandidAndBindings(data);
              })
              .catch((e) => {});

            fetch(`/data/interfaces/${data.name}.proto`)
              .then((res) => {
                if (!res.ok) {
                  throw res.statusText;
                }
                return res.text();
              })
              .then((data) => {
                setProtobuf(data);
              })
              .catch((e) => {});
          }
        };
        fetchLocalFiles();
      });
    } else {
      // Could be node principal
      fetch("/data/generated/nodes.json")
        .then((res) => res.json())
        .then((json) => {
          if (json.principalsMap && json.principalsMap[principalId]) {
            const type = Object.keys(json.principalsMap[principalId])[0];
            setNodes({
              type,
              nodes: json.principalsMap[principalId][type].map((nodeIdx) => {
                const nodeId = json.nodesList[nodeIdx];
                const nodeData = json.nodesMap[nodeId];
                return {
                  nodeId,
                  subnet: json.subnetsList[nodeData.subnet],
                  provider: json.principalsList[nodeData.provider],
                  operator: json.principalsList[nodeData.operator],
                };
              }),
            });
          }
        });
    }

    // Always fetch principal data
    fetchJSON(`/api/principals/${principalId}`).then(
      (data) => data && setPrincipalData(data)
    );
  }, [principalId, candidOverride]);

  useEffect(() => {
    // Try fetching candid if not available
    if (candid || type !== "Canister") return;

    (async () => {
      const actor = Actor.createActor(CandidService, {
        agent,
        canisterId: principalId,
      });

      try {
        const foundCandid =
          (await actor.__get_candid_interface_tmp_hack()) as string;
        setCandidAndBindings(foundCandid);
      } catch (error) {
        console.warn("no candid found");
      }
    })();
  }, [principalId, type, candid]);

  return isValid ? (
    <div className="py-16">
      <MetaTitle title={`Principal${principalId ? ` ${principalId}` : ""}`} />
      <h1 className="text-3xl mb-8 overflow-hidden overflow-ellipsis">
        Principal <small className="text-2xl">{principalId}</small>
      </h1>
      <PrincipalDetails
        principalId={principalId}
        type={type}
        nodesType={nodes?.type}
        principalData={principalData}
        canisterData={canisterData}
        className="mb-8"
      />
      {principalData?.canisterCount > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl mb-4">Controlled Canisters</h2>
          <CanistersTable controllerId={principalId} />
        </section>
      )}
      {candid && (
        <>
          {bindings && (
            <CandidUI
              key={principalId}
              candid={candid}
              canisterId={principalId}
              jsBindings={bindings.js}
              protobuf={protobuf}
              className="mb-8"
              isAttached={!!candidOverride}
            />
          )}
          <CodeBlock candid={candid} bindings={bindings} protobuf={protobuf} />
        </>
      )}
      {nodes ? (
        <>
          <NetworkGraph activeId={principalId} activeType="Principal" />
          <PrincipalNodesList type={nodes.type} nodes={nodes.nodes} />
        </>
      ) : null}
    </div>
  ) : (
    <Search404 input={principalId} />
  );
};

export default PrincipalPage;
