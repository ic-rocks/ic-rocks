import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import { BsArrowRight } from "react-icons/bs";
import { useQuery } from "react-query";
import fetchJSON from "../../lib/fetch";
import { Transaction } from "../../lib/types/API";
import BalanceLabel from "../Labels/BalanceLabel";
import IdentifierLink from "../Labels/IdentifierLink";
import { TransactionTypeLabel } from "../Labels/TransactionTypeLabel";
import { Table } from "../Tables/Table";
import InfoBox from "./InfoBox";

export default function RecentTransactionsBox() {
  const { data, isFetching } = useQuery<Transaction[]>(
    "recent-transactions",
    () => fetchJSON("/api/transactions/recent"),
    {
      placeholderData: [],
      refetchInterval: 5000,
    }
  );
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
              <span className="w-16 sm:w-20 md:w-28">
                <TransactionTypeLabel type={row.original.type} />
              </span>
            ) : (
              <IdentifierLink
                className="w-16 sm:w-20 md:w-28"
                type="account"
                id={row.original.senderId}
                name={row.original.sender.name}
              />
            );
          const receiver =
            row.original.type === "BURN" ? (
              <span className="w-16 sm:w-20 md:w-28">
                <TransactionTypeLabel type={row.original.type} />
              </span>
            ) : (
              <IdentifierLink
                className="w-16 sm:w-20 md:w-28"
                type="account"
                id={row.original.receiverId}
                name={row.original.receiver.name}
              />
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
      <div className="flex flex-col xxs:flex-row justify-between items-baseline">
        <h3 className="xxs:mb-4 text-lg">📝 Recent Ledger Transactions</h3>
        <Link href={`/transactions`}>
          <a className="text-xs link-overflow">
            view all <BsArrowRight className="inline ml-0.5" />
          </a>
        </Link>
      </div>
      <Table
        tableBodyProps={{ className: "text-sm" }}
        tableHeaderGroupProps={{
          className: "bg-heading py-0.5",
        }}
        columns={columns}
        data={data}
        count={data.length}
        loading={!data.length && isFetching}
        useSort={false}
        usePage={false}
      />
    </InfoBox>
  );
}
