import React, { useCallback, useMemo, useState } from "react";
import BalanceLabel from "../components/Labels/BalanceLabel";
import IdentifierLink from "../components/Labels/IdentifierLink";
import Ledger from "../components/LedgerPage";
import { MetaTags } from "../components/MetaTags";
import { Table } from "../components/Tables/Table";
import fetchJSON from "../lib/fetch";
import { formatNumber } from "../lib/numbers";
import { AccountsResponse } from "../lib/types/API";

const Accounts = () => {
  const [{ rows, count }, setResponse] = useState<AccountsResponse>({
    count: 0,
    rows: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async ({ pageSize, pageIndex, sortBy }) => {
    setIsLoading(true);
    const res = await fetchJSON(
      "/api/accounts?" +
        new URLSearchParams({
          ...(sortBy.length > 0
            ? { orderBy: sortBy[0].id, order: sortBy[0].desc ? "desc" : "asc" }
            : {}),
          pageSize,
          page: pageIndex,
        })
    );
    if (res) setResponse(res);
    setIsLoading(false);
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "Account",
        id: "id",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value, row }) => {
          return (
            <IdentifierLink
              type="account"
              id={value}
              name={row.original.displayName}
            />
          );
        },
        className: "px-2 flex-2 flex oneline",
      },
      {
        Header: "Principal",
        accessor: (a) => a.principalId,
        Cell: ({ value, row }) => (
          <IdentifierLink
            type="principal"
            id={value}
            name={row.original.principal?.name}
          />
        ),
        className: "px-2 sm:flex flex-1 hidden oneline",
      },
      {
        Header: "Balance",
        accessor: "balance",
        sortDescFirst: true,
        Cell: ({ value }) => <BalanceLabel value={value} />,
        className: "px-2 w-44 text-right",
      },
      {
        Header: "Tx Count",
        accessor: "tx_count",
        sortDescFirst: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-2 w-20 xs:w-28 text-right",
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "balance", desc: true }], []);

  return (
    <Ledger title="Accounts">
      <MetaTags
        title="Accounts"
        description="A list of accounts on the Internet Computer ledger."
      />
      <Table
        name="accounts"
        data={rows}
        columns={columns}
        count={count}
        fetchData={fetchData}
        loading={isLoading}
        initialSortBy={initialSort}
      />
    </Ledger>
  );
};

export default Accounts;
