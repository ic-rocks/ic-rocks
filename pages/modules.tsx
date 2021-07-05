import Link from "next/link";
import React, { useMemo } from "react";
import { FiCheck, FiFileText } from "react-icons/fi";
import { Query, useQueryClient } from "react-query";
import CanisterPage from "../components/CanisterPage";
import { MetaTags } from "../components/MetaTags";
import { DataTable } from "../components/Tables/DataTable";
import fetchJSON from "../lib/fetch";
import { formatNumber } from "../lib/numbers";
import { ModulesResponse } from "../lib/types/API";

const ModulesTable = () => {
  const columns = useMemo(
    () => [
      {
        accessor: "hasInterface",
        disableSortBy: true,
        Cell: ({ value }) => {
          return (
            value && (
              <FiFileText size={16} title="Has Interface" className="mt-1" />
            )
          );
        },
        className: "w-6 flex justify-center dark:text-gray-500",
      },
      {
        Header: "Module Hash",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value }) => (
          <Link href={`/modules/${value}`}>
            <a className="link-overflow">{value}</a>
          </Link>
        ),
        className: "pr-2 flex-2 flex overflow-hidden",
      },
      {
        Header: "Name",
        accessor: "name",
        disableSortBy: true,
        className: "px-2 flex-1 overflow-hidden overflow-ellipsis",
      },
      {
        Header: "Canisters",
        accessor: "canisterCount",
        disableSortBy: true,
        sortDescFirst: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-2 w-24 text-right",
      },
      {
        Header: "Subnets",
        accessor: "subnetCount",
        disableSortBy: true,
        sortDescFirst: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-2 w-20 text-right hidden sm:block",
      },
      {
        Header: "HTTP",
        accessor: "hasHttp",
        disableSortBy: true,
        Cell: ({ value }) => {
          return value && <FiCheck className="inline" title="Serves HTTP" />;
        },
        className: "w-16 text-center hidden sm:block",
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "canisters", desc: true }], []);

  const fetchData = ({ pageSize, pageIndex, sortBy }) =>
    fetchJSON(
      "/api/modules?" +
        new URLSearchParams({
          pageSize,
          page: pageIndex,
        })
    );

  /** Use the cached query */
  const queryClient = useQueryClient();
  const queryCache = queryClient.getQueryCache();
  const query = queryCache
    .findAll("modules")
    .find((q) => !q.queryKey[1] && !!q.queryKey[2]) as Query<ModulesResponse>;

  return (
    <>
      <p className="mb-8">
        {!query || query.state.isFetching
          ? "Searching for matching modules..."
          : `There are ${query.state.data.count} modules that match multiple canisters.`}
      </p>
      <DataTable
        name="modules"
        columns={columns}
        fetchData={fetchData}
        initialSortBy={initialSort}
      />
    </>
  );
};

const ModulesPage = () => {
  const title = "Duplicate Modules";
  return (
    <CanisterPage>
      <MetaTags
        title={title}
        description="A list of duplicate modules on the Internet Computer."
      />
      <h1 className="text-3xl my-8">{title}</h1>
      <ModulesTable />
    </CanisterPage>
  );
};

export default ModulesPage;
