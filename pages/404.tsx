import React from "react";
import { homeDescription, MetaTags } from "../components/MetaTags";

export default function Custom404() {
  return (
    <div className="pb-16">
      <MetaTags title="Not Found" description={homeDescription} />
      <h1 className="text-3xl my-8">😢 Page not found</h1>
      <div className="flex justify-center">
        <img src="/img/icrocks-melting.svg" alt="Melting ice" width="400" />
      </div>
    </div>
  );
}
