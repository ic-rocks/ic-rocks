import React from "react";
import ActiveLink from "./ActiveLink";
import { MetaTitle } from "./MetaTags";
import { SecondaryNav } from "./Nav/SecondaryNav";

const Ledger = ({ title, children }) => {
  return (
    <div className="pb-16">
      <MetaTitle title={title} />
      <SecondaryNav
        items={[
          <ActiveLink href="/accounts">Accounts</ActiveLink>,
          <ActiveLink href="/transactions">Transactions</ActiveLink>,
        ]}
      />
      <h1 className="text-3xl mb-8">{title}</h1>
      {children}
    </div>
  );
};
export default Ledger;
