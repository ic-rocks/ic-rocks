import classNames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import { useQuery } from "react-query";
import BalanceLabel from "../components/Labels/BalanceLabel";
import { MetaTags } from "../components/MetaTags";
import NeuronNav from "../components/Neurons/NeuronNav";
import { DataTable } from "../components/Tables/DataTable";
import SimpleTable from "../components/Tables/SimpleTable";
import { SelectColumnFilter } from "../components/Tables/Table";
import { entries } from "../lib/enums";
import fetchJSON from "../lib/fetch";
import useStats from "../lib/hooks/useStats";
import { formatNumber } from "../lib/numbers";
import { formatPercent } from "../lib/strings";
import { GenesisAccountStatus, InvestorType } from "../lib/types/API";

const GenesisAccountsStats = () => {
  const { data: stats } = useStats();
  const { data: genesisStats } = useQuery(
    "genesis/stats",
    () => fetchJSON("/api/genesis/stats"),
    { staleTime: Infinity }
  );

  const statsByStatusHeaders = [
    { contents: "Account Status", className: "w-36" },
    { contents: "Count", className: "flex-1 text-right hidden xs:block" },
    { contents: "Total ICP", className: "flex-2 text-right" },
    { contents: "Supply %", className: "flex-1 text-right hidden sm:block" },
  ];

  const statsByStatusRows = useMemo(() => {
    const order = ["Claimed", "Unclaimed", "Donated", "Forwarded"];
    return order.map((label, i) => {
      if (!genesisStats) {
        return [
          {
            contents: label,
          },
        ];
      }
      const row = genesisStats.byAccountStatus.find(
        (row) => row.status === GenesisAccountStatus[label]
      );
      return [
        {
          contents: label,
          className: "w-36",
        },
        {
          contents: row ? formatNumber(row.count) : "-",
          className: "flex-1 text-right hidden xs:block",
        },
        {
          contents: row ? <BalanceLabel value={row.icpts} /> : "-",
          className: "flex-2 text-right",
        },
        {
          contents:
            row && stats
              ? formatPercent(
                  Number(BigInt(row.icpts) / BigInt(1e8)) /
                    Number(BigInt(stats.supply) / BigInt(1e8))
                )
              : "-",
          className: "flex-1 text-right hidden sm:block",
        },
      ];
    });
  }, [genesisStats]);

  const statsByNeuronStateHeaders = [
    { contents: "Neuron State", className: "w-32" },
    { contents: "Count", className: "flex-1 text-right hidden xs:block" },
    { contents: "Total ICP", className: "flex-2 text-right" },
    { contents: "Supply %", className: "flex-1 text-right hidden sm:block" },
  ];

  const statsByNeuronStateRows = useMemo(() => {
    const order = [
      ["lockedCount", "lockedAmount", "Non-Dissolving"],
      ["dissolvingCount", "dissolvingAmount", "Dissolving"],
      ["dissolvedCount", "dissolvedAmount", "Dissolved"],
    ];
    return order.map(([countKey, amountKey, label], i) => {
      if (!genesisStats) {
        return [
          {
            contents: label,
          },
        ];
      }
      const count = genesisStats.byNeuronState[countKey];
      const amount = genesisStats.byNeuronState[amountKey];
      return [
        {
          contents: label,
          className: "w-32",
        },
        {
          contents: formatNumber(count),
          className: "flex-1 text-right hidden xs:block",
        },
        {
          contents: <BalanceLabel value={amount} />,
          className: "flex-2 text-right",
        },
        {
          contents: stats
            ? formatPercent(
                Number(BigInt(amount) / BigInt(1e8)) /
                  Number(BigInt(stats.supply) / BigInt(1e8))
              )
            : "-",
          className: "flex-1 text-right hidden sm:block",
        },
      ];
    });
  }, [genesisStats]);

  return (
    <section className="mb-8 md:flex-row flex-col flex gap-8">
      <div className="flex-1" style={{ minWidth: 320 }}>
        <SimpleTable headers={statsByStatusHeaders} rows={statsByStatusRows} />
      </div>
      <div className="flex-1" style={{ minWidth: 320 }}>
        <SimpleTable
          headers={statsByNeuronStateHeaders}
          rows={statsByNeuronStateRows}
        />
      </div>
    </section>
  );
};

const GenesisAccountsPage = () => {
  const columns = useMemo(
    () => [
      {
        Header: "Account",
        accessor: "id",
        Cell: ({ value }) => (
          <Link href={`/genesis/${value}`}>
            <a className="link-overflow">{value}</a>
          </Link>
        ),
        className: "px-2 flex-1 flex oneline",
        style: { minWidth: "4rem" },
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span
            className={classNames({
              "text-yellow-600 dark:text-yellow-400":
                value === GenesisAccountStatus.Donated ||
                value === GenesisAccountStatus.Forwarded,
              "text-red-500": value === GenesisAccountStatus.Unclaimed,
            })}
          >
            {GenesisAccountStatus[value]}
          </span>
        ),
        className: "px-2 w-16 sm:w-24",
        Filter: SelectColumnFilter,
        filterOptions: [["Status...", "" as any]].concat(
          entries(GenesisAccountStatus)
        ),
      },
      {
        Header: "KYC?",
        accessor: "isKyc",
        disableSortBy: true,
        Cell: ({ value, row }) =>
          value
            ? "Yes"
            : row.original.status === GenesisAccountStatus.Claimed
            ? "Unknown"
            : "No",
        className: "px-2 hidden md:block w-24",
        Filter: SelectColumnFilter,
        filterOptions: [
          ["KYC...", ""],
          ["Yes", "1"],
          ["No", "0"],
        ],
      },
      {
        Header: "Investor Type",
        accessor: "investorType",
        Cell: ({ value }) => InvestorType[value],
        className: "px-2 w-24 sm:w-36 hidden md:block",
        Filter: SelectColumnFilter,
        filterOptions: [["Investor Type...", "" as any]].concat(
          entries(InvestorType)
        ),
      },
      {
        Header: "ICP",
        accessor: "icpts",
        sortDescFirst: true,
        Cell: ({ value }) => (
          <>
            {formatNumber(value)} <span className="text-xs">ICP</span>
          </>
        ),
        className: "px-2 w-28 sm:w-32 text-right",
      },
      {
        Header: "Next Dissolve Date",
        accessor: "earliestDissolveDate",
        Cell: ({ value, row }) => {
          if (!value) {
            return "-";
          }
          const date = DateTime.fromISO(value);
          return date.diffNow().toMillis() < 0
            ? "Dissolvable"
            : date.toRelative();
        },
        className: "px-2 w-32 sm:w-48 text-right",
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "icpts", desc: true }], []);

  const fetchData = ({ pageSize, pageIndex, sortBy, filters }) => {
    const statusFilter = filters.find(({ id }) => id === "status");
    const investorTypeFilter = filters.find(({ id }) => id === "investorType");
    const isKycFilter = filters.find(({ id }) => id === "isKyc");
    return fetchJSON(
      "/api/genesis?" +
        new URLSearchParams({
          ...(sortBy.length > 0
            ? {
                orderBy: sortBy[0].id,
                order: sortBy[0].desc ? "desc" : "asc",
              }
            : {}),
          pageSize,
          page: pageIndex,
          ...(statusFilter ? { status: statusFilter.value } : {}),
          ...(investorTypeFilter
            ? { investorType: investorTypeFilter.value }
            : {}),
          ...(isKycFilter ? { isKyc: isKycFilter.value } : {}),
        })
    );
  };

  return (
    <div className="pb-16">
      <MetaTags
        title="Genesis Accounts"
        description={`Overview of the Genesis Accounts on the Internet Computer.`}
      />
      <NeuronNav />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Genesis Accounts
      </h1>
      <GenesisAccountsStats />
      <section>
        <DataTable
          name="genesis-accounts"
          persistState={true}
          style={{ minWidth: 400 }}
          className="text-xs sm:text-base"
          columns={columns}
          fetchData={fetchData}
          initialSortBy={initialSort}
          useFilter={true}
        />
      </section>
    </div>
  );
};

export default GenesisAccountsPage;
