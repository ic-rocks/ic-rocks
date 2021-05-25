import { Principal } from "@dfinity/agent";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import CanisterDetails from "../../components/CanisterDetails";
import CodeBlock from "../../components/CodeBlock";
import { TITLE_SUFFIX } from "../../lib/constants";

const didc = import("../../lib/didc-js/didc_js");

const Interfaces = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [candid, setCandid] = useState("");
  const [bindings, setBindings] = useState(null);
  const { canisterId } = router.query as { canisterId: string };

  useEffect(() => {
    if (typeof canisterId !== "string" || !canisterId) return;

    try {
      Principal.fromText(canisterId);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
      setCandid("");
      console.warn(error);
      return;
    }

    fetch("/interfaces/canisters.json")
      .then((res) => res.json())
      .then((json) => {
        const name = json[canisterId];
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
  }, [canisterId]);

  const title = isValid ? `Canister ${canisterId}` : "Canister not found";

  return (
    <div className="py-16">
      <Head>
        <title>
          {title} {TITLE_SUFFIX}
        </title>
      </Head>
      <h1 className="text-3xl mb-8">{title}</h1>
      {isValid && (
        <CanisterDetails
          candid={candid}
          canisterId={canisterId}
          canisterName={name}
          className="mb-8"
        />
      )}
      {candid && (
        <CodeBlock candid={candid} bindings={bindings} className="mb-8" />
      )}
    </div>
  );
};

export default Interfaces;
