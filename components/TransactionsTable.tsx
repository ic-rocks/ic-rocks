import { DateTime } from "luxon";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import fetchJSON from "../lib/fetch";
import { TransactionsResponse } from "../lib/types/API";
import BalanceLabel from "./Labels/BalanceLabel";
import { TransactionTypeLabel } from "./Labels/TransactionTypeLabel";
import { Table } from "./Table";

export const TransactionsTable = ({
  accountId = "",
}: {
  accountId?: string;
}) => {
  const [{ rows, count }, setResponse] = useState<TransactionsResponse>({
    count: 0,
    rows: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async ({ pageSize, pageIndex, sortBy }) => {
    setIsLoading(true);
    const res = await fetchJSON(
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
          accountId,
        })
    );
    if (res) setResponse(res);
    setIsLoading(false);
  }, []);

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
        className:
          "px-2 flex-1 flex whitespace-nowrap overflow-hidden overflow-ellipsis",
        style: { minWidth: "4rem" },
        disableSortBy: true,
      },
      {
        Header: "Timestamp",
        accessor: "blockHeight",
        Cell: ({ value, row }) =>
          DateTime.fromISO(row.original.createdDate).toRelative(),
        className: "px-2 w-32 whitespace-nowrap",
        sortDescFirst: true,
      },
      {
        Header: "From",
        accessor: "senderId",
        Cell: ({ value, row }) =>
          row.original.type === "MINT" ? (
            <TransactionTypeLabel type={row.original.type} />
          ) : value !== accountId ? (
            <Link href={`/account/${value}`}>
              <a className="link-overflow">
                {row.original.sender.name || value}
              </a>
            </Link>
          ) : (
            <span className="overflow-hidden overflow-ellipsis">
              {row.original.sender.name || value}
            </span>
          ),
        className: "px-2 flex-1 flex whitespace-nowrap overflow-hidden",
        style: { minWidth: "4rem" },
        disableSortBy: true,
      },
      {
        Header: "To",
        accessor: "receiverId",
        Cell: ({ value, row }) =>
          row.original.type === "BURN" ? (
            <TransactionTypeLabel type={row.original.type} />
          ) : value !== accountId ? (
            <Link href={`/account/${value}`}>
              <a className="link-overflow">
                {row.original.receiver.name || value}
              </a>
            </Link>
          ) : (
            <span className="overflow-hidden overflow-ellipsis">
              {row.original.receiver.name || value}
            </span>
          ),
        className: "px-2 flex-1 flex whitespace-nowrap overflow-hidden",
        style: { minWidth: "4rem" },
        disableSortBy: true,
      },
      {
        Header: "Amount",
        accessor: "amount",
        Cell: ({ value }) => <BalanceLabel value={value} />,
        className: "px-2 w-36 whitespace-nowrap text-right",
        sortDescFirst: true,
      },
      {
        Header: "Fee",
        accessor: "fee",
        Cell: ({ value }) => <BalanceLabel value={value} />,
        className: "px-2 w-24 hidden sm:block whitespace-nowrap text-right",
        disableSortBy: true,
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "blockHeight", desc: true }], []);

  return (
    <Table
      className="text-xs xs:text-sm sm:text-base"
      style={{ minWidth: "400px" }}
      data={rows}
      columns={columns}
      count={count}
      fetchData={fetchData}
      loading={isLoading}
      initialSortBy={initialSort}
    />
  );
};
