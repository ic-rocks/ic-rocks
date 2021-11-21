import React from "react";
import { homeDescription, MetaTags } from "./MetaTags";

export default function Search404({ input }: { input: string }) {
  return (
    <div className="pb-16">
      <MetaTags title="Not Found" description={homeDescription} />
      <h1 className="my-8 text-3xl">😢 Not found</h1>
      <p>You searched for: {input}</p>
      <div className="flex justify-center">
        <img src="/img/icrocks-melting.svg" alt="Melting ice" width="400" />
      </div>
    </div>
  );
}
