import Head from "next/head";
import React, { useEffect, useState } from "react";
import { BiPencil } from "react-icons/bi";
import CanistersList from "../components/CanistersList";
import { TITLE_SUFFIX } from "../lib/constants";

const GITHUB_REPO = "https://github.com/ic-cubes/ic-tools";

const Canisters = () => {
  const [canisters, setCanisters] = useState({});

  useEffect(() => {
    fetch("/interfaces/canisters.json")
      .then((res) => res.json())
      .then((json) => {
        setCanisters(json);
      });
  }, []);

  const title = "Canisters";

  return (
    <div className="py-16">
      <Head>
        <title>
          {title} {TITLE_SUFFIX}
        </title>
      </Head>
      <h1 className="text-3xl mb-8">{title}</h1>
      <section>
        <CanistersList canisters={canisters} className="mb-8" />
        <a
          className="inline-flex items-center text-blue-600 hover:underline"
          href={`${GITHUB_REPO}/edit/main/public/interfaces/canisters.json`}
          target="_blank"
        >
          <BiPencil className="mr-0.5" /> Edit canisters.json
        </a>
      </section>
    </div>
  );
};

export default Canisters;
