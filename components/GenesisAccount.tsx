import classNames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import BalanceLabel from "../components/Labels/BalanceLabel";
import NeuronsTable from "../components/Neurons/NeuronsTable";
import SimpleTable from "../components/Tables/SimpleTable";
import { groupBy } from "../lib/arrays";
import { formatDuration } from "../lib/datetime";
import fetchJSON from "../lib/fetch";
import { formatNumber } from "../lib/numbers";
import {
  GenesisAccountStatus,
  InvestorType,
  NeuronsResponse,
} from "../lib/types/API";

const GenesisAccount = ({ genesisAccount }: { genesisAccount: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [neuronData, setNeuronData] = useState<NeuronsResponse>(null);

  useEffect(() => {
    if (!genesisAccount) return;

    fetchJSON(`/api/genesis/${genesisAccount}`).then(
      (data) => data && setData(data)
    );
    setIsLoading(false);
  }, [genesisAccount]);

  const summaryRows = useMemo(() => {
    let stats;
    if (neuronData) {
      const groups = groupBy(neuronData.rows, "state");
      stats = ["1", "2", "3"].map((k) => {
        const [amount, sumTime] = (groups[k] || []).reduce(
          ([amt, ts]: [bigint, number], curr) => [
            amt + BigInt(curr.originalStake),
            ts + DateTime.fromISO(curr.dissolveDate).toSeconds(),
          ],
          [BigInt(0), 0]
        );
        const count = (groups[k] || []).length;
        const avgDuration = DateTime.fromSeconds(sumTime / count).diffNow([
          "years",
          "months",
          "days",
        ]);
        return { amount, count, avgDuration };
      });
    }
    return [
      [
        {
          contents: "Principal",
          className: "w-36",
        },
        {
          contents: data?.principal ? (
            <Link href={`/principal/${data.principal.id}`}>
              <a className="link-overflow">
                {data.principal.name || data.principal.id}
              </a>
            </Link>
          ) : (
            "-"
          ),
        },
      ],
      [
        {
          contents: "Status",
          className: "w-36",
        },
        {
          contents: data ? (
            <span
              className={classNames({
                "text-yellow-600 dark:text-yellow-400":
                  data.status === GenesisAccountStatus.Donated ||
                  data.status === GenesisAccountStatus.Forwarded,
                "text-red-500": data.status === GenesisAccountStatus.Unclaimed,
              })}
            >
              {GenesisAccountStatus[data.status]}
            </span>
          ) : (
            "-"
          ),
        },
      ],
      [
        {
          contents: "KYC?",
          className: "w-36",
        },
        {
          contents: data
            ? data.isKyc
              ? "Yes"
              : data.status === GenesisAccountStatus.Claimed
              ? "Unknown"
              : "No"
            : "-",
        },
      ],
      [
        {
          contents: "Investor Type",
          className: "w-36",
        },
        {
          contents: data ? InvestorType[data.investorType] : "-",
        },
      ],
      [
        {
          contents: "Locked ICP",
          className: "w-36",
        },
        {
          contents: stats ? (
            <div className="flex">
              <strong className="w-6 pr-2 text-right">{stats[0].count}</strong>
              <div className="w-44 text-right pr-6">
                <BalanceLabel value={stats[0].amount} />
              </div>
              {stats[0].count > 0 && (
                <div className="text-gray-500">
                  avg. {formatDuration(stats[0].avgDuration)}
                </div>
              )}
            </div>
          ) : (
            "-"
          ),
        },
      ],
      [
        {
          contents: "Dissolving ICP",
          className: "w-36",
        },
        {
          contents: stats ? (
            <div className="flex flex-wrap">
              <strong className="w-6 pr-2 text-right">{stats[1].count}</strong>
              <div className="w-44 text-right pr-6">
                <BalanceLabel value={stats[1].amount} />
              </div>
              {stats[1].count > 0 && (
                <div className="text-gray-500">
                  avg. {formatDuration(stats[1].avgDuration)}
                </div>
              )}
            </div>
          ) : (
            "-"
          ),
        },
      ],
      [
        {
          contents: "Dissolved ICP",
          className: "w-36",
        },
        {
          contents: stats ? (
            <div className="flex">
              <strong className="w-6 pr-2 text-right">{stats[2].count}</strong>
              <div className="w-36 text-right">
                <BalanceLabel value={stats[2].amount} />
              </div>
            </div>
          ) : (
            "-"
          ),
        },
      ],
      [
        {
          contents: "Total ICP",
          className: "w-36",
        },
        {
          contents: data ? (
            <>
              <strong className="w-6 pr-2 text-right inline-block">
                {data.neuronCount}
              </strong>
              <div className="inline-block w-36 text-right">
                {formatNumber(data.icpts)} <span className="text-xs">ICP</span>
              </div>
            </>
          ) : (
            "-"
          ),
        },
      ],
    ];
  }, [data, neuronData]);

  return (
    <>
      <h1 className="text-3xl my-8 overflow-hidden">
        Genesis Account <small className="text-xl">{genesisAccount}</small>
      </h1>
      <section className="mb-8">
        <SimpleTable
          headers={[{ contents: "Account Details" }]}
          rows={summaryRows}
        />
      </section>
      {genesisAccount && (
        <NeuronsTable
          genesisAccount={genesisAccount}
          onFetch={setNeuronData}
          name="genesis"
        />
      )}
    </>
  );
};

export default GenesisAccount;
