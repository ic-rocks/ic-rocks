import classNames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import { useQuery } from "react-query";
import BalanceLabel from "../components/Labels/BalanceLabel";
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
import IdentifierLink from "./Labels/IdentifierLink";
import { neuronsTableColumns } from "./Neurons/NeuronsTable";
import { Table } from "./Tables/Table";

const GenesisAccount = ({ genesisAccount }: { genesisAccount: string }) => {
  const { data } = useQuery(
    ["genesis", genesisAccount],
    () => fetchJSON(`/api/genesis/${genesisAccount}`),
    {
      enabled: !!genesisAccount,
      staleTime: Infinity,
    },
  );

  const { data: neurons, isFetching: isNeuronsFetching } =
    useQuery<NeuronsResponse>(
      ["genesis.neurons", genesisAccount],
      () => {
        return fetchJSON(`/api/neurons/genesis/${genesisAccount}`);
      },
      { placeholderData: { rows: [], count: 0 }, staleTime: Infinity },
    );

  const summaryRows = useMemo(() => {
    let stats;

    if (neurons.rows.length > 0) {
      const groups = groupBy(neurons.rows, "state");
      stats = ["1", "2", "3"].map((k) => {
        const [amount, sumTime] = (groups[k] || []).reduce(
          ([amt, ts]: [bigint, number], curr) => [
            amt + BigInt(curr.originalStake),
            ts + DateTime.fromISO(curr.dissolveDate).toSeconds(),
          ],
          [BigInt(0), 0],
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
            <IdentifierLink
              type="principal"
              id={data.principal.id}
              name={data.principal.name}
            />
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
          contents: "KYC Proposal",
          className: "w-36",
        },
        {
          contents: data ? (
            data.principal?.kyc[0] ? (
              <Link href={`/proposal/${data.principal?.kyc[0].proposalId}`}>
                <a className="link-overflow">
                  {data.principal?.kyc[0].proposalId}
                </a>
              </Link>
            ) : data.status === GenesisAccountStatus.Claimed ? (
              "Not Found"
            ) : (
              "No"
            )
          ) : (
            "-"
          ),
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
          contents: "Non-Dissolving ICP",
          className: "w-36",
        },
        {
          contents: stats ? (
            <div className="flex">
              <strong className="pr-2 w-6 text-right">{stats[0].count}</strong>
              <div className="pr-6 w-44 text-right">
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
              <strong className="pr-2 w-6 text-right">{stats[1].count}</strong>
              <div className="pr-6 w-44 text-right">
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
              <strong className="pr-2 w-6 text-right">{stats[2].count}</strong>
              <div className="pr-6 w-44 text-right">
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
            <div className="flex">
              <strong className="inline-block pr-2 w-6 text-right">
                {data.neuronCount}
              </strong>
              <div className="pr-6 w-44 text-right">
                {formatNumber(data.icpts)} <span className="text-xs">ICP</span>
              </div>
            </div>
          ) : (
            "-"
          ),
        },
      ],
    ];
  }, [data, neurons]);

  return (
    <>
      <h1 className="overflow-hidden my-8 text-3xl">
        Genesis Account <small className="text-xl">{genesisAccount}</small>
      </h1>
      <section className="mb-8">
        <SimpleTable
          headers={[{ contents: "Account Details" }]}
          rows={summaryRows}
        />
      </section>
      <Table
        columns={neuronsTableColumns}
        data={neurons?.rows}
        count={neurons?.count}
        name="genesis.neurons"
        style={{ minWidth: 480 }}
        className="text-xs sm:text-base"
        loading={isNeuronsFetching}
        initialSortBy={[{ id: "dissolveDate", desc: false }]}
        manualSortBy={false}
        initialPageSize={50}
        useFilter={true}
        persistState={true}
      />
    </>
  );
};

export default GenesisAccount;
