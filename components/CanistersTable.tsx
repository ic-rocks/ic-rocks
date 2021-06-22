import { DateTime } from "luxon";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiExternalLink, FiFileText } from "react-icons/fi";
import fetchJSON from "../lib/fetch";
import { CanistersResponse, SubnetResponse } from "../lib/types/API";
import { SelectColumnFilter, Table } from "./Tables/Table";

export const CanistersTable = ({
  name,
  controllerId,
  moduleId,
  onFetch,
}: {
  name?: string;
  controllerId?: string;
  moduleId?: string;
  onFetch?: (res?) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [{ rows, count }, setResponse] = useState<CanistersResponse>({
    count: 0,
    rows: [],
  });

  const [subnets, setSubnets] = useState<SubnetResponse[]>([]);
  useEffect(() => {
    fetchJSON("/api/subnets").then(
      (data) =>
        data &&
        setSubnets(
          data.sort((a, b) => (a.displayName > b.displayName ? 1 : -1))
        )
    );
  }, []);

  const columns = useMemo(
    () =>
      [
        {
          accessor: "hasInterface",
          disableSortBy: true,
          Cell: ({ value }) => {
            return value && <FiFileText size={16} title="Has Interface" />;
          },
          defaultClass: false,
          className: "flex w-6 items-center justify-center dark:text-gray-500",
          Filter: SelectColumnFilter,
          filterOptions: [
            ["Interface...", ""],
            ["Has Interface", "1"],
            ["No Interface", "0"],
          ],
        },
        {
          Header: "Canister",
          id: "id",
          accessor: "id",
          disableSortBy: true,
          Cell: ({ value, row }) => {
            return (
              <Link href={`/principal/${value}`}>
                <a className="link-overflow">
                  {row.original.principal?.name || value}
                </a>
              </Link>
            );
          },
          className: "pr-2 flex-1 flex oneline",
          Filter: SelectColumnFilter,
          filterOptions: [
            ["Name...", ""],
            ["Has Name", "1"],
            ["No Name", "0"],
          ],
        },
        !controllerId && {
          Header: "Controller",
          accessor: "controllerId",
          disableSortBy: true,
          Cell: ({ value, row }) => (
            <Link href={`/principal/${value}`}>
              <a className="link-overflow">
                {row.original.controller?.name || value}
              </a>
            </Link>
          ),
          className: "px-2 sm:flex flex-1 hidden oneline",
          Filter: SelectColumnFilter,
          filterOptions: [
            ["Controller...", ""],
            ["Has Controller", "1"],
            ["No Controller", "0"],
          ],
        },
        !moduleId && {
          Header: "Module",
          id: "moduleId",
          accessor: (d) => d.module?.id,
          disableSortBy: true,
          Cell: ({ value, row }) => (
            <Link href={`/modules/${value}`}>
              <a className="link-overflow">
                {row.original.module?.name || value}
              </a>
            </Link>
          ),
          className: "px-2 xs:flex flex-1 hidden oneline",
          Filter: SelectColumnFilter,
          filterOptions: [
            ["Module...", ""],
            ["Has Module", "1"],
            ["No Module", "0"],
          ],
        },
        {
          Header: "Subnet",
          accessor: "subnetId",
          disableSortBy: true,
          Cell: ({ value, row }) =>
            value ? (
              <Link href={`/subnet/${value}`}>
                <a className="link-overflow">
                  {row.original.subnet.displayName}
                </a>
              </Link>
            ) : (
              "-"
            ),
          className: "px-2 sm:flex flex-1 hidden oneline",
          Filter: SelectColumnFilter,
          filterOptions: [["Subnet...", ""]].concat(
            subnets.map(({ displayName, id }) => [displayName, id])
          ),
        },
        {
          Header: "Last Updated",
          accessor: "latestVersionDate",
          sortDescFirst: true,
          Cell: ({ value }) => DateTime.fromISO(value).toRelative(),
          className: "px-2 w-36 text-right",
        },
        {
          Header: "URL",
          accessor: (d) => d.module?.hasHttp,
          id: "http",
          disableSortBy: true,
          Cell: ({ value, row }) =>
            value ? (
              <a
                href={`https://${row.original.id}.raw.ic0.app`}
                target="_blank"
              >
                <FiExternalLink className="inline link-overflow" />
              </a>
            ) : null,
          className: "w-16 text-center hidden sm:block",
        },
      ].filter(Boolean),
    [subnets]
  );

  const initialSort = useMemo(
    () => [{ id: "latestVersionDate", desc: true }],
    []
  );

  const fetchData = useCallback(
    async ({ pageSize, pageIndex, sortBy, filters }) => {
      const hasInterfaceFilter = filters.find(
        ({ id }) => id === "hasInterface"
      );
      const controllerFilter = filters.find(({ id }) => id === "controllerId");
      const moduleFilter = filters.find(({ id }) => id === "moduleId");
      const canisterFilter = filters.find(({ id }) => id === "id");
      const subnetFilter = filters.find(({ id }) => id === "subnetId");
      setIsLoading(true);
      const res = await fetchJSON(
        "/api/canisters?" +
          new URLSearchParams({
            ...(sortBy.length > 0
              ? {
                  orderBy: sortBy[0].id,
                  order: sortBy[0].desc ? "desc" : "asc",
                }
              : {}),
            ...(controllerId ? { controllerId } : {}),
            ...(moduleId ? { moduleId } : {}),
            ...(hasInterfaceFilter
              ? { hasInterface: hasInterfaceFilter.value }
              : {}),
            ...(canisterFilter ? { hasName: canisterFilter.value } : {}),
            ...(moduleFilter ? { hasModule: moduleFilter.value } : {}),
            ...(controllerFilter
              ? { hasController: controllerFilter.value }
              : {}),
            ...(subnetFilter ? { subnetId: subnetFilter.value } : {}),
            pageSize,
            page: pageIndex,
          })
      );
      if (onFetch) onFetch(res);
      if (res) setResponse(res);
      setIsLoading(false);
    },
    [controllerId, moduleId]
  );

  return (
    <Table
      name={name}
      columns={columns}
      data={rows}
      count={count}
      fetchData={fetchData}
      loading={isLoading}
      initialSortBy={initialSort}
      useFilter={true}
    />
  );
};
