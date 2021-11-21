import React from "react";
import ActiveLink from "../ActiveLink";
import { SecondaryNav } from "../Nav/SecondaryNav";

export default function ProposalNav() {
  return (
    <SecondaryNav
      items={[
        <ActiveLink key="proposals" href="/proposals">
          Proposals
        </ActiveLink>,
        <ActiveLink key="proposals-kyc" href="/proposal/kyc">
          KYC
        </ActiveLink>,
        <ActiveLink key="proposal-node-rewards" href="/proposal/node-rewards">
          Node Rewards
        </ActiveLink>,
        <ActiveLink key="proposal-icp" href="/proposal/icp">
          Exchange Rate
        </ActiveLink>,
      ]}
    />
  );
}
