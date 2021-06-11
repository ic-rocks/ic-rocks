import React from "react";
import { MetaTags } from "../components/MetaTags";
import { PrincipalsTable } from "../components/PrincipalsTable";

const Principals = () => {
  const title = "Principals";

  return (
    <div className="py-16">
      <MetaTags
        title={title}
        description="A list of known principals on the Internet Computer."
      />
      <h1 className="text-3xl mb-8">{title}</h1>
      <PrincipalsTable />
    </div>
  );
};

export default Principals;
