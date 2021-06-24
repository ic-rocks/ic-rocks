import React from "react";
import ActiveLink from "../ActiveLink";
import { SecondaryNav } from "../Nav/SecondaryNav";

export default function ProposalNav() {
  return (
    <SecondaryNav
      items={[
        <ActiveLink href="/proposals">Proposals</ActiveLink>,
        <ActiveLink href="/kyc">KYC</ActiveLink>,
        <ActiveLink href="/icp">ICP Price Oracle</ActiveLink>,
      ]}
    />
  );
}
