import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import fetchJSON from "../lib/fetch";
import BalanceLabel from "./Labels/BalanceLabel";
import IdentifierLink from "./Labels/IdentifierLink";
import { TransactionTypeLabel } from "./Labels/TransactionTypeLabel";
import { DataTable } from "./Tables/DataTable";

export const TransactionsTable = ({ accountId }: { accountId?: string }) => {
  const fetchData = ({ pageSize, pageIndex, sortBy }) =>
    fetchJSON(
      `/api/transactions?` +
        new URLSearchParams({
          ...(sortBy.length > 0
            ? {
                orderBy: sortBy[0].id,
                order: sortBy[0].desc ? "desc" : "asc",
              }
            : {}),
          pageSize,
          page: pageIndex,
          ...(accountId ? { accountId } : {}),
        })
    );

  const columns = useMemo(
    () => [
      {
        Header: "Tx Hash",
        accessor: "id",
        id: "id",
        Cell: ({ value }) => (
          <Link href={`/transaction/${value}`}>
            <a className="link-overflow">{value}</a>
          </Link>
        ),
        className: "px-2 flex-1 flex oneline",
        style: { minWidth: "4rem" },
        disableSortBy: true,
      },
      {
        Header: "Timestamp",
        accessor: "blockHeight",
        Cell: ({ row }) =>
          DateTime.fromISO(row.original.createdDate).toRelative(),
        className: "px-2 w-32 oneline",
        sortDescFirst: true,
      },
      {
        Header: "From",
        accessor: "senderId",
        Cell: ({ value, row }) =>
          row.original.type === "MINT" ? (
            <TransactionTypeLabel type={row.original.type} />
          ) : (
            <IdentifierLink
              type="account"
              id={value}
              name={row.original.sender.displayName}
              isLink={value !== accountId}
            />
          ),
        className: "px-2 flex-1 flex oneline",
        style: { minWidth: "4rem" },
        disableSortBy: true,
      },
      {
        Header: "To",
        accessor: "receiverId",
        Cell: ({ value, row }) =>
          row.original.type === "BURN" ? (
            <TransactionTypeLabel type={row.original.type} />
          ) : (
            <IdentifierLink
              type="account"
              id={value}
              name={row.original.receiver.displayName}
              isLink={value !== accountId}
            />
          ),
        className: "px-2 flex-1 flex oneline",
        style: { minWidth: "4rem" },
        disableSortBy: true,
      },
      {
        Header: "Amount",
        accessor: "amount",
        Cell: ({ value }) => <BalanceLabel value={value} />,
        className: "px-2 w-36 text-right oneline",
        sortDescFirst: true,
      },
      {
        Header: "Fee",
        accessor: "fee",
        Cell: ({ value }) => <BalanceLabel value={value} />,
        className: "px-2 w-24 hidden sm:block text-right oneline",
        disableSortBy: true,
      },
    ],
    [accountId]
  );

  const initialSort = useMemo(() => [{ id: "blockHeight", desc: true }], []);

  return (
    <DataTable
      name="transactions"
      extraQueryParams={accountId}
      persistState={!accountId}
      className="text-xs xs:text-sm sm:text-base"
      style={{ minWidth: "400px" }}
      columns={columns}
      fetchData={fetchData}
      initialSortBy={initialSort}
    />
  );
};
