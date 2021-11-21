import React from "react";
import ActiveLink from "./ActiveLink";
import { SecondaryNav } from "./Nav/SecondaryNav";

const CanisterPage = ({ children }) => {
  return (
    <div className="pb-16">
      <SecondaryNav
        items={[
          <ActiveLink key="canisters" href="/canisters">
            Canisters
          </ActiveLink>,
          <ActiveLink key="modules" href="/modules">
            Modules
          </ActiveLink>,
          <ActiveLink key="interfaces" href="/interfaces">
            Interfaces
          </ActiveLink>,
        ]}
      />
      {children}
    </div>
  );
};
export default CanisterPage;
