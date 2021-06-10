import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import CanisterPage from "../components/CanisterPage";
import { MetaTitle } from "../components/MetaTags";
import { Table } from "../components/Table";
import fetchJSON from "../lib/fetch";
import { formatNumber } from "../lib/numbers";
import { ModulesResponse } from "../lib/types/API";

const ModulesTable = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [{ rows, count }, setResponse] = useState<ModulesResponse>({
    count: 0,
    rows: [],
  });

  const columns = useMemo(
    () => [
      {
        Header: "Module Hash",
        accessor: "moduleHash",
        disableSortBy: true,
        Cell: ({ value }) => (
          <Link href={`/modules/${value}`}>
            <a className="link-overflow">{value}</a>
          </Link>
        ),
        className: "px-2 flex-1 flex overflow-hidden text-overflow-ellipsis",
      },
      {
        Header: "Canisters",
        accessor: "canisters",
        disableSortBy: true,
        sortDescFirst: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-2 w-28 text-right",
      },
      {
        Header: "Subnets",
        accessor: "subnets",
        disableSortBy: true,
        sortDescFirst: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-2 w-20 text-right",
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "canisters", desc: true }], []);

  const fetchData = useCallback(async ({ pageSize, pageIndex, sortBy }) => {
    setIsLoading(true);
    const res = await fetchJSON(
      "/api/modules?" +
        new URLSearchParams({
          pageSize,
          page: pageIndex,
        })
    );
    if (res) setResponse(res);
    setIsLoading(false);
  }, []);

  return (
    <>
      <p className="mb-8">
        {isLoading
          ? "Searching for matching modules..."
          : `There are ${count} modules that match multiple canisters.`}
      </p>
      <Table
        columns={columns}
        data={rows}
        count={count}
        fetchData={fetchData}
        loading={isLoading}
        initialSortBy={initialSort}
      />
    </>
  );
};

const ModulesPage = () => {
  const title = "Duplicate Modules";
  return (
    <CanisterPage>
      <MetaTitle title={title} />
      <h1 className="text-3xl mb-8">{title}</h1>
      <ModulesTable />
    </CanisterPage>
  );
};

export default ModulesPage;
