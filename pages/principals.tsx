import React from "react";
import { MetaTitle } from "../components/MetaTags";
import { PrincipalsTable } from "../components/PrincipalsTable";

const Principals = () => {
  const title = "Principals";

  return (
    <div className="py-16">
      <MetaTitle title={title} />
      <h1 className="text-3xl mb-8">{title}</h1>
      <PrincipalsTable />
    </div>
  );
};

export default Principals;
