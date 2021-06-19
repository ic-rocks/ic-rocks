import React, { useEffect, useState } from "react";
import ActiveLink from "../components/ActiveLink";
import BalanceLabel from "../components/Labels/BalanceLabel";
import { MetaTags } from "../components/MetaTags";
import { SecondaryNav } from "../components/Nav/SecondaryNav";
import NeuronsTable from "../components/NeuronsTable";
import { useGlobalState } from "../components/StateContext";
import SimpleTable from "../components/Tables/SimpleTable";
import fetchJSON from "../lib/fetch";
import { formatNumber } from "../lib/numbers";
import { NeuronState } from "../lib/types/governance";

const NeuronsPage = () => {
  const { stats } = useGlobalState();
  const [isLoading, setIsLoading] = useState(true);
  const [neuronStats, setStats] = useState([]);

  useEffect(() => {
    fetchJSON("/api/neurons/stats").then((data) => data && setStats(data));
    setIsLoading(false);
  }, []);

  const headers = [
    { contents: "Neuron Status", className: "w-32" },
    { contents: "Count", className: "w-24 text-right" },
    { contents: "Controllers", className: "w-28 text-right" },
    { contents: "Total ICP", className: "w-48 text-right" },
    { contents: "Supply %", className: "w-28 text-right" },
  ];

  const summaryRows = neuronStats.map((row) => [
    {
      contents: NeuronState[row.state],
      className: "w-32",
    },
    {
      contents: formatNumber(row.count),
      className: "w-24 text-right",
    },
    {
      contents: formatNumber(row.controllers),
      className: "w-28 text-right",
    },
    {
      contents: <BalanceLabel value={row.stake} />,
      className: "w-48 text-right",
    },
    {
      contents: stats
        ? (
            (100 * Number(BigInt(row.stake) / BigInt(1e8))) /
            Number(BigInt(stats.supply) / BigInt(1e8))
          ).toFixed(2) + "%"
        : "-",
      className: "w-28 text-right",
    },
  ]);

  return (
    <div className="pb-16">
      <MetaTags
        title="Neurons"
        description={`Overview of neurons on the Internet Computer.`}
      />
      <SecondaryNav
        items={[
          <ActiveLink href="/neurons">Neurons</ActiveLink>,
          <ActiveLink href="/genesis">Genesis Accounts</ActiveLink>,
        ]}
      />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Known Neurons
      </h1>
      <section className="mb-8">
        <SimpleTable headers={headers} rows={summaryRows} />
      </section>
      <NeuronsTable />
    </div>
  );
};

export default NeuronsPage;
