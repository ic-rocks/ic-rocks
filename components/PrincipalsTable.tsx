import React, { useMemo } from "react";
import fetchJSON from "../lib/fetch";
import { formatNumber } from "../lib/numbers";
import IdentifierLink from "./Labels/IdentifierLink";
import { DataTable } from "./Tables/DataTable";

export const PrincipalsTable = () => {
  const columns = useMemo(
    () => [
      {
        Header: "Principal",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value, row }) => (
          <IdentifierLink
            type="principal"
            id={value}
            name={row.original.name}
          />
        ),
        className: "pl-2 flex-1 flex oneline",
      },
      {
        Header: "Canisters",
        accessor: "canisterCount",
        sortDescFirst: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-1 w-28 text-right",
      },
      {
        Header: "Nodes",
        accessor: "nodeCount",
        sortDescFirst: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-1 w-16 xs:w-24 text-right",
      },
      {
        Header: "Accounts",
        accessor: "accountCount",
        disableSortBy: true,
        Cell: ({ value }) => formatNumber(value),
        className: "pr-2 w-24 text-right",
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "canisterCount", desc: true }], []);

  const fetchData = ({ pageSize, pageIndex, sortBy }) =>
    fetchJSON(
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

  return (
    <DataTable
      name="principals"
      persistState={true}
      columns={columns}
      fetchData={fetchData}
      initialSortBy={initialSort}
      staleTime={Infinity}
    />
  );
};
