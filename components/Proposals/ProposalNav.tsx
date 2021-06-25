import React from "react";
import ActiveLink from "../ActiveLink";
import { SecondaryNav } from "../Nav/SecondaryNav";

export default function ProposalNav() {
  return (
    <SecondaryNav
      items={[
        <ActiveLink href="/proposals">Proposals</ActiveLink>,
        <ActiveLink href="/proposal/kyc">KYC</ActiveLink>,
        <ActiveLink href="/proposal/node-rewards">Node Rewards</ActiveLink>,
        <ActiveLink href="/proposal/icp">Exchange Rate</ActiveLink>,
      ]}
    />
  );
}
