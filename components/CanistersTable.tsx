import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import { FiExternalLink, FiFileText } from "react-icons/fi";
import fetchJSON from "../lib/fetch";
import useSubnets from "../lib/hooks/useSubnets";
import IdentifierLink from "./Labels/IdentifierLink";
import { DataTable } from "./Tables/DataTable";
import { SelectColumnFilter } from "./Tables/Table";

export const CanistersTable = ({
  name,
  controllerId,
  moduleId,
}: {
  name: string;
  controllerId?: string;
  moduleId?: string;
}) => {
  const { data: subnets } = useSubnets();

  const columns = useMemo(() => {
    const sortedSubnets = subnets.sort((a, b) =>
      a.displayName > b.displayName ? 1 : -1
    );
    return [
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
        Cell: ({ value, row }) => (
          <IdentifierLink
            type="principal"
            id={value}
            name={row.original.principal?.name}
          />
        ),
        className: "pr-2 flex-1 flex oneline",
        Filter: SelectColumnFilter,
        filterOptions: [
          ["Name...", ""],
          ["Has Name", "1"],
          ["No Name", "0"],
        ],
      },
      !controllerId && {
        Header: "Controllers",
        accessor: "controllers",
        disableSortBy: true,
        Cell: ({ value, row }) =>
          value.length <= 2
            ? value.map(({ id, name }) => (
                <IdentifierLink
                  className="flex-1"
                  type="principal"
                  id={id}
                  name={name}
                />
              ))
            : `${value.length} controllers`,
        className: "px-2 sm:flex gap-1 flex-1 hidden oneline",
        Filter: SelectColumnFilter,
        filterOptions: [
          ["Controllers...", ""],
          ["Has Controllers", "1"],
          ["No Controllers", "0"],
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
              <a className="link-overflow">{row.original.subnet.displayName}</a>
            </Link>
          ) : (
            "-"
          ),
        className: "px-2 sm:flex flex-1 hidden oneline",
        Filter: SelectColumnFilter,
        filterOptions: [["Subnet...", ""]].concat(
          sortedSubnets.map(({ displayName, id }) => [displayName, id])
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
            <a href={`https://${row.original.id}.raw.ic0.app`} target="_blank">
              <FiExternalLink className="inline link-overflow" />
            </a>
          ) : null,
        className: "w-16 text-center hidden sm:block",
      },
    ].filter(Boolean);
  }, [subnets]);

  const initialSort = useMemo(
    () => [{ id: "latestVersionDate", desc: true }],
    []
  );

  const fetchData = ({ pageSize, pageIndex, sortBy, filters }) => {
    const hasInterfaceFilter = filters.find(({ id }) => id === "hasInterface");
    const controllerFilter = filters.find(({ id }) => id === "controllers");
    const moduleFilter = filters.find(({ id }) => id === "moduleId");
    const canisterFilter = filters.find(({ id }) => id === "id");
    const subnetFilter = filters.find(({ id }) => id === "subnetId");
    return fetchJSON(
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
  };

  return (
    <DataTable
      name={name}
      extraQueryParams={{ controllerId, moduleId }}
      persistState={!controllerId && !moduleId}
      columns={columns}
      fetchData={fetchData}
      initialSortBy={initialSort}
      useFilter={true}
    />
  );
};
