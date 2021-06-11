import React from "react";
import { homeDescription, MetaTags } from "../components/MetaTags";

export default function Home() {
  return (
    <div className="py-16">
      <MetaTags
        title="ic.rocks | Internet Computer Explorer"
        suffix={false}
        image="hero"
        description={homeDescription}
      />
      <h1 className="text-3xl mb-16">The Internet Computer rocks</h1>
    </div>
  );
}
