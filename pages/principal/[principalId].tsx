import { Principal } from "@dfinity/agent";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import CodeBlock from "../../components/CodeBlock";
import { MetaTitle } from "../../components/MetaTags";
import PrincipalDetails from "../../components/PrincipalDetails";
import Search404 from "../../components/Search404";

const didc = import("../../lib/didc-js/didc_js");

const PrincipalPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [candid, setCandid] = useState("");
  const [bindings, setBindings] = useState(null);
  const { principalId } = router.query as { principalId: string };

  useEffect(() => {
    if (typeof principalId !== "string" || !principalId) return;

    setName("");
    setCandid("");
    setBindings(null);

    try {
      Principal.fromText(principalId);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
      console.warn(error);
      return;
    }

    fetch("/interfaces/canisters.json")
      .then((res) => res.json())
      .then((json) => {
        const name = json[principalId];
        setName(name);

        if (name) {
          fetch(`/interfaces/${name}.did`)
            .then((res) => {
              if (!res.ok) {
                setCandid("");
                throw res.statusText;
              }
              return res.text();
            })
            .then((data) => {
              setCandid(data);
              didc.then((mod) => {
                const gen = mod.generate(data);
                setBindings(gen);
              });
            })
            .catch(console.error);
        } else {
          setCandid("");
        }
      });
  }, [principalId]);

  return isValid ? (
    <div className="py-16">
      <MetaTitle title={`Principal ${principalId}`} />
      <h1 className="text-3xl mb-8 overflow-hidden overflow-ellipsis">
        Principal <small className="text-2xl">{principalId}</small>
      </h1>
      {isValid && (
        <PrincipalDetails
          candid={candid}
          canisterId={principalId}
          canisterName={name}
          className="mb-8"
        />
      )}
      {candid && (
        <CodeBlock candid={candid} bindings={bindings} className="mb-8" />
      )}
    </div>
  ) : (
    <Search404 input={principalId} />
  );
};

export default PrincipalPage;
