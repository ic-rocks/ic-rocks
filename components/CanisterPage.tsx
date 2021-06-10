import React from "react";
import ActiveLink from "./ActiveLink";
import { SecondaryNav } from "./SecondaryNav";

const CanisterPage = ({ children }) => {
  return (
    <div className="pb-16">
      <SecondaryNav
        items={[
          <ActiveLink href="/canisters">Canisters</ActiveLink>,
          <ActiveLink href="/interfaces">Interfaces</ActiveLink>,
          <ActiveLink href="/modules">Modules</ActiveLink>,
        ]}
      />
      {children}
    </div>
  );
};
export default CanisterPage;
