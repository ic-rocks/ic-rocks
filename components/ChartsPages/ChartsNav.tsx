import React from "react";
import ActiveLink from "../ActiveLink";
import { SecondaryNav } from "../Nav/SecondaryNav";

export default function ChartsNav() {
  return (
    <SecondaryNav
      items={[
        <ActiveLink key="charts" href="/charts">
          Charts
        </ActiveLink>,
        <ActiveLink key="-charts-metrics" href="/charts/metrics">
          Custom Metrics
        </ActiveLink>,
      ]}
    />
  );
}
