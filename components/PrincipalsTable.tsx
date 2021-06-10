import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import fetchJSON from "../lib/fetch";
import { formatNumber } from "../lib/numbers";
import { PrincipalsResponse } from "../lib/types/API";
import { Table } from "./Table";

export const PrincipalsTable = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [{ rows, count }, setResponse] = useState<PrincipalsResponse>({
    count: 0,
    rows: [],
  });

  const columns = useMemo(
    () => [
      {
        Header: "Principal",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value, row }) => {
          return (
            <Link href={`/principal/${value}`}>
              <a className="link-overflow">{row.original.name || value}</a>
            </Link>
          );
        },
        className: "pr-2 flex-1 flex whitespace-nowrap overflow-hidden",
      },
      {
        Header: "Controlled Canisters",
        accessor: "canisterCount",
        sortDescFirst: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-2 w-24 sm:w-48 text-right",
      },
      {
        Header: "Accounts",
        accessor: "accountCount",
        disableSortBy: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-2 w-24 text-right",
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "canisterCount", desc: true }], []);

  const fetchData = useCallback(async ({ pageSize, pageIndex, sortBy }) => {
    setIsLoading(true);
    const res = await fetchJSON(
      "/api/principals?" +
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
    if (res) setResponse(res);
    setIsLoading(false);
  }, []);

  return (
    <Table
      columns={columns}
      data={rows}
      count={count}
      fetchData={fetchData}
      loading={isLoading}
      initialSortBy={initialSort}
    />
  );
};
