import React from "react";
import ActiveLink from "../ActiveLink";
import { SecondaryNav } from "../Nav/SecondaryNav";

export default function NeuronNav() {
  return (
    <SecondaryNav
      items={[
        <ActiveLink href="/neurons">Neurons</ActiveLink>,
        <ActiveLink href="/neuron/allocations">Allocations</ActiveLink>,
        <ActiveLink href="/genesis">Genesis Accounts</ActiveLink>,
      ]}
    />
  );
}
