import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import CandidUI from "../../components/CandidUI";
import NetworkGraph from "../../components/Charts/NetworkGraph";
import CodeBlock from "../../components/CodeBlock";
import { MetaTitle } from "../../components/MetaTags";
import { PrincipalNodesList } from "../../components/NodeList";
import PrincipalDetails from "../../components/PrincipalDetails";
import Search404 from "../../components/Search404";
import CandidService from "../../lib/canisters/get-candid.did";

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
  const [name, setName] = useState("");
  const [candid, setCandid] = useState("");
  const [bindings, setBindings] = useState(null);
  const [protobuf, setProtobuf] = useState("");
  const [nodes, setNodes] = useState(null);

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

    setName("");
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
      // Try fetching candid if not available
      (async () => {
        if (candid) return;

        const actor = Actor.createActor(CandidService, {
          agent,
          canisterId: principalId,
        });

        try {
          const foundCandid =
            (await actor.__get_candid_interface_tmp_hack()) as string;
          setCandidAndBindings(foundCandid);
        } catch (error) {}
      })();

      fetch("/data/json/canisters.json")
        .then((res) => res.json())
        .then((json) => {
          const name = json[principalId];
          setName(name);
          if (name && !candidOverride) {
            fetch(`/data/interfaces/${name}.did`)
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

            fetch(`/data/interfaces/${name}.proto`)
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
        });
    } else {
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
  }, [principalId, candidOverride]);

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
        canisterName={name}
        className="mb-8"
      />
      {candid && (
        <>
          {bindings && (
            <CandidUI
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
