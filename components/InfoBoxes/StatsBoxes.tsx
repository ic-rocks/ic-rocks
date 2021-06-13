import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import extendProtobuf from "agent-pb";
import protobuf from "protobufjs";
import React, { useEffect, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import protobufJson from "../../lib/canisters/proto.json";
import fetchJSON from "../../lib/fetch";
import useInterval from "../../lib/hooks/useInterval";
import { formatNumber, formatNumberUSD } from "../../lib/numbers";
import { StatsResponse } from "../../lib/types/API";
import { UInt64Value } from "../../lib/types/canisters";
import SparklineChart from "../Charts/SparklineChart";
import { useGlobalState } from "../StateContext";
const root = protobuf.Root.fromJSON(protobufJson as protobuf.INamespace);
const agent = new HttpAgent({ host: "https://ic0.app" });
const cyclesMinting = Actor.createActor(() => IDL.Service({}), {
  agent,
  canisterId: "rkp4c-7iaaa-aaaaa-aaaca-cai",
});
extendProtobuf(cyclesMinting, root.lookupService("CyclesMinting"));

export default function StatsBoxes() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatsResponse>(null);
  const { markets } = useGlobalState();

  const fetchStats = async () => {
    fetchJSON("/api/stats").then(
      (res) => res && setStats((d) => ({ ...d, ...res }))
    );

    const tCycles =
      BigInt(
        ((await cyclesMinting.total_cycles_minted({})) as UInt64Value).value
      ) / BigInt(1e12);
    setStats((d) => ({ ...d, tCycles }));
  };

  useInterval(fetchStats, 10000);

  useEffect(() => {
    (async () => {
      await fetchStats();
      setIsLoading(false);
    })();
  }, []);

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
          {markets && <strong>{formatNumberUSD(markets.ticker.price)}</strong>}
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
                  {isLoading ? (
                    <CgSpinner className="animate-spin" />
                  ) : stats[id] != null ? (
                    render(stats[id])
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
