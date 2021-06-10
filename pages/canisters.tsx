import React from "react";
import ActiveLink from "../components/ActiveLink";
import { CanistersTable } from "../components/CanistersTable";
import { MetaTitle } from "../components/MetaTags";
import { SecondaryNav } from "../components/SecondaryNav";

const Canisters = () => {
  const title = "Canisters";

  return (
    <div className="pb-16">
      <MetaTitle title={title} />
      <SecondaryNav
        items={[
          <ActiveLink href="/canisters">Canisters</ActiveLink>,
          <ActiveLink href="/interfaces">Interfaces</ActiveLink>,
        ]}
      />
      <h1 className="text-3xl mb-8">{title}</h1>
      <CanistersTable />
    </div>
  );
};

export default Canisters;
