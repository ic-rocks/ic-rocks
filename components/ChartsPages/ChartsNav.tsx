import React from "react";
import ActiveLink from "../ActiveLink";
import { SecondaryNav } from "../Nav/SecondaryNav";

export default function ChartsNav() {
  return (
    <SecondaryNav
      items={[
        <ActiveLink href="/charts">Charts</ActiveLink>,
        <ActiveLink href="/charts/metrics">Custom Metrics</ActiveLink>,
      ]}
    />
  );
}
