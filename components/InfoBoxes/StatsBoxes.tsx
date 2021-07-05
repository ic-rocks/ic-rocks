import React from "react";
import { CgSpinner } from "react-icons/cg";
import useMarkets from "../../lib/hooks/useMarkets";
import useStats from "../../lib/hooks/useStats";
import useTotalCycles from "../../lib/hooks/useTotalCycles";
import { formatNumber, formatNumberUSD } from "../../lib/numbers";
import SparklineChart from "../Charts/SparklineChart";

export default function StatsBoxes() {
  const { data: markets } = useMarkets();
  const { data: stats } = useStats();
  const { data: tCycles } = useTotalCycles();

  const mergedStats = stats ? { ...stats, tCycles } : null;

  const dataLabels = [
    { id: "subnets", label: "Subnets", render: formatNumber },
    { id: "nodes", label: "Nodes", render: formatNumber },
    { id: "controllers", label: "Controllers", render: formatNumber },
    { id: "canisters", label: "Canisters", render: formatNumber },
    { id: "accounts", label: "Ledger Accounts", render: formatNumber },
    { id: "txs", label: "ICP Transactions", render: formatNumber },
    {
      id: "tCycles",
      label: "Total Cycles",
      render: (x) => `${formatNumber(x)} TC`,
    },
    {
      id: "supply",
      label: "Total ICP",
      render: (x) => formatNumber(BigInt(x) / BigInt(1e8)),
    },
  ];

  return (
    <section className="rounded p-4 border border-gray-500 flex flex-row-reverse flex-wrap sm:flex-nowrap justify-evenly gap-8 mb-8">
      <div className="flex-none flex flex-col w-full xs:w-64">
        <div className="flex justify-between">
          <label>ICP Price</label>
          {markets?.ticker && (
            <strong>{formatNumberUSD(markets.ticker.price)}</strong>
          )}
        </div>

        {!markets ? <CgSpinner className="animate-spin" /> : <SparklineChart />}
      </div>

      <div className="flex flex-wrap gap-4">
        {dataLabels.map(({ id, label, render }) => {
          return (
            <div key={id} className="w-36">
              <div className="flex flex-col items-end">
                <label>{label}</label>
                <strong className="text-2xl">
                  {!mergedStats ? (
                    <CgSpinner className="animate-spin" />
                  ) : mergedStats[id] != null ? (
                    render(mergedStats[id])
                  ) : (
                    "-"
                  )}
                </strong>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
