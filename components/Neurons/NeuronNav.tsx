import React from "react";
import ActiveLink from "../ActiveLink";
import { SecondaryNav } from "../Nav/SecondaryNav";

export default function NeuronNav() {
  return (
    <SecondaryNav
      items={[
        <ActiveLink key="neurons" href="/neurons">
          Neurons
        </ActiveLink>,
        <ActiveLink key="neuron-allocations" href="/neuron/allocations">
          Allocations
        </ActiveLink>,
        <ActiveLink key="genesis" href="/genesis">
          Genesis Accounts
        </ActiveLink>,
      ]}
    />
  );
}
