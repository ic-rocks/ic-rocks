import React from "react";
import { homeDescription, MetaTags } from "./MetaTags";

export default function Search404({ input }) {
  return (
    <div className="pb-16">
      <MetaTags title="Not Found" description={homeDescription} />
      <h1 className="text-3xl my-8">Not found</h1>
      <p>You searched for: {input}</p>
    </div>
  );
}
