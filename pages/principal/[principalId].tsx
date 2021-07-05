import { Actor, Certificate, HttpAgent } from "@dfinity/agent";
import { blobFromText, blobFromUint8Array } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import CandidUI from "../../components/CandidUI";
import { CanistersTable } from "../../components/CanistersTable";
import NetworkGraph from "../../components/Charts/NetworkGraph";
import CodeBlock from "../../components/CodeBlock";
import GenesisAccount from "../../components/GenesisAccount";
import { MetaTags } from "../../components/MetaTags";
import PrincipalDetails from "../../components/PrincipalDetails";
import { PrincipalNodesTable } from "../../components/PrincipalNodesTable";
import Search404 from "../../components/Search404";
import CandidService from "../../lib/canisters/get-candid.did";
import fetchJSON from "../../lib/fetch";
import { APIPrincipal, Canister } from "../../lib/types/API";

const didc = import("didc");

const getPrincipalType = (principalId): PrincipalType | null => {
  if (!principalId) return null;

  let principalRaw;
  try {
    principalRaw = Principal.fromText(principalId).toUint8Array();
  } catch (error) {
    console.warn(error);
    return;
  }

  switch (principalRaw.slice(-1)[0]) {
    case 1:
      return "Canister";
    case 2:
      return "User";
    case 3:
      return "Derived";
    case 4:
      return "Anonymous";
  }
  return "Unknown";
};

export type PrincipalType =
  | "Canister"
  | "User"
  | "Anonymous"
  | "Derived"
  | "Unknown";

const agent = new HttpAgent({ host: "https://ic0.app" });

const PrincipalPage = () => {
  const router = useRouter();
  const { principalId, candid: candidOverride } = router.query as {
    principalId: string;
    candid?: string;
  };
  const [candid, setCandid] = useState("");
  const [bindings, setBindings] = useState(null);
  const [protobuf, setProtobuf] = useState("");

  const setCandidAndBindings = (newCandid: string) => {
    setCandid(newCandid);
    if (newCandid) {
      didc.then((mod) => {
        const gen = mod.generate(newCandid);
        if (!gen) {
          console.warn("failed to generate bindings");
        }
        setBindings(gen);
      });
    } else {
      setBindings(null);
    }
  };

  const type = useMemo(() => getPrincipalType(principalId), [principalId]);

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
  }, [principalId, candidOverride]);

  const { data: principalData } = useQuery<APIPrincipal>(
    ["principals", principalId],
    () => fetchJSON(`/api/principals/${principalId}`),
    {
      enabled: !!principalId,
    }
  );
  const { data: canisterData } = useQuery<Canister>(
    ["canisters", principalId],
    () => fetchJSON(`/api/canisters/${principalId}`),
    {
      enabled: !!principalId && type === "Canister",
    }
  );

  useEffect(() => {
    if (principalData?.node) {
      router.replace(`/node/${principalId}`);
    }
  }, [principalData]);

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
  }, [principalId, candid]);

  useEffect(() => {
    if (!canisterData) return;

    /** Read from state to verify data integrity */
    const checkState = async () => {
      const principal = blobFromUint8Array(
        Principal.fromText(principalId).toUint8Array()
      );
      const pathCommon = [blobFromText("canister"), principal];
      const pathModuleHash = pathCommon.concat(blobFromText("module_hash"));
      const pathController = pathCommon.concat(blobFromText("controller"));
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
          ? Principal.fromUint8Array(cert["cert"].delegation.subnet_id).toText()
          : null;
        if (subnet) {
          if (subnet !== canisterData.subnetId) {
            console.warn(
              `subnet: api=${canisterData.subnetId} state=${subnet}`
            );
          }
        } else {
          console.warn("state: no subnet");
        }
        const certController = cert.lookup(pathController);
        if (certController) {
          const controller = Principal.fromUint8Array(certController).toText();
          if (canisterData && canisterData.controllerId !== controller) {
            console.warn(
              `controller: api=${canisterData.controllerId} state=${controller}`
            );
          }
        } else {
          console.warn("state: no controller");
        }
        const moduleHash = cert.lookup(pathModuleHash)?.toString("hex");
        if (moduleHash && canisterData.module?.id !== moduleHash) {
          console.warn(
            `moduleHash: api=${canisterData.module?.id} state=${moduleHash}`
          );
        }
      } else {
        console.warn("state: unable to verify cert", cert);
      }
    };
    checkState();

    /** Try to fetch local interface file(s) */
    const fetchLocalFiles = async () => {
      if (canisterData.principal?.name && !candidOverride) {
        fetch(`/data/interfaces/${canisterData.principal.name}.did`)
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

        fetch(`/data/interfaces/${canisterData.principal.name}.proto`)
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

    /** If candid isn't available, try to fetch from local */
    if (canisterData.module?.candid) {
      setCandidAndBindings(canisterData.module.candid);
    } else {
      fetchLocalFiles();
    }
  }, [canisterData]);

  if (principalId && !type) {
    return <Search404 input={principalId} />;
  }

  const showNodes =
    principalData?.operatorOf.length > 0 ||
    principalData?.providerOf.length > 0;

  return (
    <div className="pb-16">
      <MetaTags
        title={`Principal${principalId ? ` ${principalId}` : ""}`}
        description={`Details for principal${
          principalId ? ` ${principalId}` : ""
        } on the Internet Computer.`}
      />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Principal <small className="text-xl">{principalId}</small>
      </h1>
      <PrincipalDetails
        principalId={principalId}
        type={type}
        principalData={principalData}
        canisterData={canisterData}
        className="mb-8"
      />
      {principalData?.genesisAccount?.id && (
        <GenesisAccount genesisAccount={principalData.genesisAccount.id} />
      )}
      {principalData?.canisterCount > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl mb-4">Controlled Canisters</h2>
          <CanistersTable
            name="controlled-canisters"
            controllerId={principalId}
          />
        </section>
      )}
      {candid && (
        <section>
          <h2 className="text-2xl mb-4">Canister Interface</h2>
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
        </section>
      )}
      {showNodes ? (
        <>
          <NetworkGraph activeId={principalId} activeType="Principal" />
          <PrincipalNodesTable data={principalData} />
        </>
      ) : null}
    </div>
  );
};

export default PrincipalPage;
