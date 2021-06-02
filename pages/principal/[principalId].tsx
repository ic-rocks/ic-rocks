import { Actor, HttpAgent, Principal } from "@dfinity/agent";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import CandidUI from "../../components/CandidUI";
import CodeBlock from "../../components/CodeBlock";
import { MetaTitle } from "../../components/MetaTags";
import PrincipalDetails from "../../components/PrincipalDetails";
import Search404 from "../../components/Search404";
import CandidService from "../../lib/canisters/get-candid.did";

const didc = import("../../lib/didc-js/didc_js");

const agent = new HttpAgent({ host: "https://ic0.app" });

const PrincipalPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [candid, setCandid] = useState("");
  const [bindings, setBindings] = useState(null);
  const [protobuf, setProtobuf] = useState("");
  const { principalId, candid: candidOverride } = router.query as {
    principalId: string;
    candid?: string;
  };

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

    try {
      Principal.fromText(principalId);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
      console.warn(error);
      return;
    }

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

    fetch("/json/canisters.json")
      .then((res) => res.json())
      .then((json) => {
        const name = json[principalId];
        setName(name);
        if (name && !candidOverride) {
          fetch(`/interfaces/${name}.did`)
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

          fetch(`/interfaces/${name}.proto`)
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
  }, [principalId, candidOverride]);

  return isValid ? (
    <div className="py-16">
      <MetaTitle title={`Principal${principalId ? ` ${principalId}` : ""}`} />
      <h1 className="text-3xl mb-8 overflow-hidden overflow-ellipsis">
        Principal <small className="text-2xl">{principalId}</small>
      </h1>
      {isValid && (
        <PrincipalDetails
          canisterId={principalId}
          canisterName={name}
          className="mb-8"
        />
      )}
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
    </div>
  ) : (
    <Search404 input={principalId} />
  );
};

export default PrincipalPage;
