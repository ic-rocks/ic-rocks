import React from "react";
import { MetaTitle } from "../components/MetaTags";
import { DESCRIPTION } from "../lib/constants";

export default function Home() {
  return (
    <div className="py-16">
      <MetaTitle title="Home" />
      <h1 className="text-3xl mb-16">Internet Computer Tools</h1>
      <p>{DESCRIPTION}</p>
    </div>
  );
}
