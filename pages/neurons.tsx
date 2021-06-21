import React, { useEffect, useState } from "react";
import BalanceLabel from "../components/Labels/BalanceLabel";
import { MetaTags } from "../components/MetaTags";
import NeuronNav from "../components/Neurons/NeuronNav";
import NeuronsTable from "../components/Neurons/NeuronsTable";
import { useGlobalState } from "../components/StateContext";
import SimpleTable from "../components/Tables/SimpleTable";
import { entries } from "../lib/enums";
import fetchJSON from "../lib/fetch";
import { formatNumber } from "../lib/numbers";
import { formatPercent } from "../lib/strings";
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
    { contents: "Count", className: "w-24 text-right hidden xs:block" },
    { contents: "Controllers", className: "w-28 text-right hidden sm:block" },
    { contents: "Total ICP", className: "w-48 text-right" },
    { contents: "Supply %", className: "w-28 text-right hidden xs:block" },
  ];

  const summaryRows =
    neuronStats.length > 0
      ? neuronStats.map((row) => [
          {
            contents: NeuronState[row.state],
            className: "w-32",
          },
          {
            contents: formatNumber(row.count),
            className: "w-24 text-right hidden xs:block",
          },
          {
            contents: formatNumber(row.controllers),
            className: "w-28 text-right hidden sm:block",
          },
          {
            contents: <BalanceLabel value={row.stake} />,
            className: "w-48 text-right",
          },
          {
            contents: stats
              ? formatPercent(
                  Number(BigInt(row.stake) / BigInt(1e8)) /
                    Number(BigInt(stats.supply) / BigInt(1e8))
                )
              : "-",
            className: "w-28 text-right hidden xs:block",
          },
        ])
      : entries(NeuronState)
          .slice(1, 3)
          .map(([label]) => [
            {
              contents: label,
            },
          ]);

  return (
    <div className="pb-16">
      <MetaTags
        title="Neurons"
        description={`Overview of neurons on the Internet Computer.`}
      />
      <NeuronNav />
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
