import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { useQuery } from "react-query";
import BalanceLabel from "../../components/Labels/BalanceLabel";
import IdentifierLink from "../../components/Labels/IdentifierLink";
import { MetaTags } from "../../components/MetaTags";
import ProposalNav from "../../components/Proposals/ProposalNav";
import { DataTable } from "../../components/Tables/DataTable";
import SimpleTable from "../../components/Tables/SimpleTable";
import fetchJSON from "../../lib/fetch";
import { formatNumber } from "../../lib/numbers";

const NodeRewardsStats = () => {
  const { data: stats } = useQuery("node-rewards/stats", () =>
    fetchJSON("/api/node-rewards/stats")
  );

  const summaryHeaders = [
    {
      contents: (
        <>
          Details
          <span
            aria-label="Node Providers are minted ICP as reward for participating in the
      network"
            data-balloon-pos="right"
            data-balloon-length="medium"
          >
            <BsInfoCircle className="inline ml-1 text-xs align-middle" />
          </span>
        </>
      ),
    },
  ];

  const summaryRows = useMemo(() => {
    return [
      [
        { contents: "Total Rewards Minted", className: "w-48" },
        {
          contents: stats ? <BalanceLabel value={stats.total_amount} /> : "-",
        },
      ],
      [
        { contents: "Principals", className: "w-48" },
        {
          contents: stats ? formatNumber(stats.principals) : "-",
        },
      ],
    ];
  }, [stats]);

  return <SimpleTable headers={summaryHeaders} rows={summaryRows} />;
};

export default function NodeRewardsPage() {
  const columns = useMemo(
    () => [
      {
        Header: "Principal",
        accessor: (d) => d.principal.id,
        disableSortBy: true,
        Cell: ({ value, row }) => (
          <IdentifierLink
            type="principal"
            name={row.original.principal.name}
            id={value}
          />
        ),
        className: "px-2 flex-1 flex oneline",
      },
      {
        Header: "Account",
        id: "accounts",
        accessor: (d) => d.account?.id,
        disableSortBy: true,
        Cell: ({ value, row }) =>
          value ? (
            <IdentifierLink
              type="account"
              name={row.original.account.name}
              id={value}
            />
          ) : (
            "-"
          ),
        className: "px-2 flex-1 flex oneline",
      },
      {
        Header: "Nodes",
        id: "providerOfCount",
        accessor: (d) => d.principal.providerOfCount,
        disableSortBy: true,
        Cell: ({ value }) => (value > 0 ? formatNumber(value) : "-"),
        className: "px-1 w-20 text-right",
      },
      {
        Header: "Amount",
        accessor: "amount",
        sortDescFirst: true,
        Cell: ({ value }) => <BalanceLabel value={value} />,
        className: "px-1 w-28 sm:w-36 text-right",
      },
      {
        Header: "Proposal",
        accessor: "proposalId",
        sortDescFirst: true,
        Cell: ({ value }) => (
          <Link href={`/proposal/${value}`}>
            <a className="link-overflow">{formatNumber(value)}</a>
          </Link>
        ),
        className: "px-1 w-16 xs:w-24 text-right",
      },
      {
        Header: "Date",
        accessor: (d) => d.proposal.decidedDate,
        disableSortBy: true,
        Cell: ({ value, row }) =>
          DateTime.fromISO(
            value || row.original.proposal.proposalDate
          ).toLocaleString(),
        className: "pr-2 w-24 text-right hidden sm:block",
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "proposalId", desc: true }], []);

  const fetchData = ({ pageSize, pageIndex, sortBy }) =>
    fetchJSON(
      "/api/node-rewards?" +
        new URLSearchParams({
          ...(sortBy.length > 0
            ? {
                orderBy: sortBy[0].id,
                order: sortBy[0].desc ? "desc" : "asc",
              }
            : {}),
          pageSize,
          page: pageIndex,
        })
    );

  return (
    <div className="pb-16">
      <MetaTags
        title="Node Rewards"
        description={`A list of Node Rewards on the Internet Computer.`}
      />
      <ProposalNav />
      <h1 className="overflow-hidden my-8 text-3xl overflow-ellipsis">
        Node Provider Rewards
      </h1>
      <section className="mb-8">
        <NodeRewardsStats />
      </section>
      <section>
        <DataTable
          name="node-rewards"
          className="text-xs sm:text-base"
          columns={columns}
          fetchData={fetchData}
          initialSortBy={initialSort}
        />
      </section>
    </div>
  );
}
