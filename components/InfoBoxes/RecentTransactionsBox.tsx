import { DateTime } from "luxon";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import fetchJSON from "../../lib/fetch";
import { CanistersResponse } from "../../lib/types/API";
import BalanceLabel from "../Labels/BalanceLabel";
import { TransactionTypeLabel } from "../Labels/TransactionTypeLabel";
import { Table } from "../Tables/Table";
import InfoBox from "./InfoBox";

export default function RecentTransactionsBox() {
  const [isLoading, setIsLoading] = useState(true);
  const [{ rows, count }, setResponse] = useState<CanistersResponse>({
    count: 0,
    rows: [],
  });
  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);
  const fetchData = useCallback(async () => {
    const res = await fetchJSON(
      "/api/transactions?" +
        new URLSearchParams({
          pageSize: "6",
        })
    );
    if (res) setResponse(res);
    setIsLoading(false);
  }, []);
  const columns = useMemo(
    () => [
      {
        Header: "Time",
        accessor: "createdDate",
        Cell: ({ value, row }) => (
          <Link href={`/transaction/${row.original.id}`}>
            <a className="link-overflow">
              {DateTime.fromISO(value).toRelative({ style: "narrow" })}
            </a>
          </Link>
        ),
        className: "px-2 w-20 oneline",
      },
      {
        Header: "Transaction",
        accessor: "id",
        Cell: ({ value, row }) => {
          const sender =
            row.original.type === "MINT" ? (
              <TransactionTypeLabel type={row.original.type} />
            ) : (
              <Link href={`/account/${row.original.senderId}`}>
                <a className="w-16 link-overflow">
                  {row.original.sender.name || row.original.senderId}
                </a>
              </Link>
            );
          const receiver =
            row.original.type === "BURN" ? (
              <TransactionTypeLabel type={row.original.type} />
            ) : (
              <Link href={`/account/${row.original.receiverId}`}>
                <a className="w-16 link-overflow">
                  {row.original.receiver.name || row.original.receiverId}
                </a>
              </Link>
            );
          return (
            <>
              {sender}
              <BsArrowRight className="mx-1" />
              {receiver}
            </>
          );
        },
        className: "px-2 flex-1 flex items-center oneline",
      },
      {
        Header: "Amount",
        accessor: "amount",
        Cell: ({ value }) => <BalanceLabel value={value} />,
        className: "px-2 w-28 text-right oneline",
      },
    ],
    []
  );

  return (
    <InfoBox>
      <div className="flex xxs:flex-row flex-col justify-between items-baseline">
        <h3 className="text-lg xxs:mb-4">📝 Recent Ledger Transactions</h3>
        <Link href={`/transactions`}>
          <a className="text-xs link-overflow">
            view all <BsArrowRight className="ml-0.5 inline" />
          </a>
        </Link>
      </div>
      <Table
        tableBodyProps={{ className: "text-sm" }}
        tableHeaderGroupProps={{
          className: "bg-heading py-0.5",
        }}
        columns={columns}
        data={rows}
        count={count}
        fetchData={fetchData}
        loading={isLoading}
        useSort={false}
        usePage={false}
      />
    </InfoBox>
  );
}
