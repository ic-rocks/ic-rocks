import classNames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ActiveLink from "../components/ActiveLink";
import BalanceLabel from "../components/Labels/BalanceLabel";
import { MetaTags } from "../components/MetaTags";
import { SecondaryNav } from "../components/Nav/SecondaryNav";
import { useGlobalState } from "../components/StateContext";
import SimpleTable from "../components/Tables/SimpleTable";
import { Table } from "../components/Tables/Table";
import { entries } from "../lib/enums";
import fetchJSON from "../lib/fetch";
import { formatNumber } from "../lib/numbers";
import {
  GenesisAccountStatus,
  InvestorType,
  NeuronsResponse,
} from "../lib/types/API";

const GenesisAccountsPage = () => {
  const { stats } = useGlobalState();
  const [isLoading, setIsLoading] = useState(false);
  const [genesisStats, setStats] = useState([]);

  useEffect(() => {
    fetchJSON("/api/genesis/stats").then((data) => data && setStats(data));
    setIsLoading(false);
  }, []);

  const statsHeaders = [
    { contents: "Status", className: "w-32" },
    { contents: "Count", className: "w-24 text-right" },
    { contents: "Total ICP", className: "w-40 text-right" },
    { contents: "Supply %", className: "w-28 text-right" },
  ];

  const statsRows =
    genesisStats.length > 0
      ? [genesisStats[1], genesisStats[0], ...genesisStats.slice(2)].map(
          (row) => [
            {
              contents: GenesisAccountStatus[row.status],
              className: "w-32",
            },
            {
              contents: formatNumber(row.count),
              className: "w-24 text-right",
            },
            {
              contents: <BalanceLabel value={row.icpts} />,
              className: "w-40 text-right",
            },
            {
              contents: stats
                ? (
                    (100 * Number(BigInt(row.icpts) / BigInt(1e8))) /
                    Number(BigInt(stats.supply) / BigInt(1e8))
                  ).toFixed(2) + "%"
                : "-",
              className: "w-28 text-right",
            },
          ]
        )
      : [];

  const [{ ...filters }, setFilters] = useState({
    status: "",
    investorType: "",
    isKyc: "",
  });
  const [{ rows, count }, setResponse] = useState<NeuronsResponse>({
    count: 0,
    rows: [],
  });

  useEffect(() => {
    fetchJSON("/api/genesis").then((data) => data && setResponse(data));
  }, []);

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
        className: "px-2 w-24",
      },
      {
        Header: "KYCed?",
        accessor: "isKyc",
        Cell: ({ value }) => (value ? "Yes" : "No"),
        className: "px-2 w-24",
      },
      {
        Header: "Investor Type",
        accessor: "investorType",
        Cell: ({ value }) => InvestorType[value],
        className: "px-2 w-36",
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
        className: "px-2 w-32 text-right",
      },
      // {
      //   Header: "Account",
      //   accessor: "accountId",
      //   Cell: ({ value, row }) => (
      //     <Link href={`/account/${value}`}>
      //       <a className="link-overflow">{value}</a>
      //     </Link>
      //   ),
      //   className: "px-2 flex-1 flex oneline",
      // },
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
        className: "px-2 w-48 text-right",
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "icpts", desc: true }], []);

  const fetchData = useCallback(
    async ({ pageSize, pageIndex, sortBy }) => {
      setIsLoading(true);
      const res = await fetchJSON(
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
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.investorType
              ? { investorType: filters.investorType }
              : {}),
            ...(filters.isKyc ? { isKyc: filters.isKyc } : {}),
          })
      );
      if (res) setResponse(res);
      setIsLoading(false);
    },
    [filters.status, filters.investorType, filters.isKyc]
  );

  const toggleFilters = [
    {
      id: "status",
      label: "Status",
      options: [["Status...", "" as any]].concat(
        entries(GenesisAccountStatus).filter(([_, n]) => n > 0)
      ),
    },
    {
      id: "investorType",
      label: "Investor Type",
      options: [["Investor Type...", "" as any]].concat(entries(InvestorType)),
    },
    {
      id: "isKyc",
      label: "isKyc",
      options: [
        ["KYC...", ""],
        ["Yes", "1"],
        ["No", "0"],
      ],
    },
  ];

  return (
    <div className="pb-16">
      <MetaTags
        title="Genesis Accounts"
        description={`Overview of the Genesis Accounts on the Internet Computer.`}
      />
      <SecondaryNav
        items={[
          <ActiveLink href="/neurons">Neurons</ActiveLink>,
          <ActiveLink href="/genesis">Genesis Accounts</ActiveLink>,
        ]}
      />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Genesis Accounts
      </h1>
      <section className="mb-8">
        <SimpleTable headers={statsHeaders} rows={statsRows} />
      </section>
      <section>
        <div className="py-2 flex flex-wrap gap-1">
          {toggleFilters.map(({ id, label, options }) => (
            <select
              key={id}
              className="flex-1 p-1 bg-gray-100 dark:bg-gray-800 cursor-pointer"
              onChange={(e) =>
                setFilters((s) => ({ ...s, [id]: e.target.value }))
              }
              value={filters[id]}
              style={{ minWidth: "8rem" }}
            >
              {options.map(([name, value]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          ))}
        </div>
        <Table
          columns={columns}
          data={rows}
          count={count}
          fetchData={fetchData}
          loading={isLoading}
          initialSortBy={initialSort}
          useExpand={true}
        />
      </section>
    </div>
  );
};

export default GenesisAccountsPage;
