import { DateTime } from "luxon";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiFileText } from "react-icons/fi";
import fetchJSON from "../lib/fetch";
import { CanistersResponse, SubnetResponse } from "../lib/types/API";
import { Table } from "./Table";

export const CanistersTable = ({
  controllerId,
  moduleHash,
}: {
  controllerId?: string;
  moduleHash?: string;
}) => {
  const [{ subnetId, ...filters }, setFilters] = useState({
    hasCandid: "",
    hasName: "",
    hasModule: "",
    hasController: "",
    subnetId: "",
  });
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
          accessor: "hasCandid",
          disableSortBy: true,
          Cell: ({ value }) => {
            return value && <FiFileText size={16} title="Candid Interface" />;
          },
          defaultClass: false,
          className: "flex w-6 items-center justify-center dark:text-gray-500",
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
          className: "pr-2 flex-1 flex whitespace-nowrap overflow-hidden",
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
          className:
            "px-2 sm:flex flex-1 hidden whitespace-nowrap overflow-hidden",
        },
        {
          Header: "Subnet",
          accessor: "subnetId",
          disableSortBy: true,
          Cell: ({ value, row }) => (
            <Link href={`/subnet/${value}`}>
              <a className="link-overflow">{row.original.subnet.displayName}</a>
            </Link>
          ),
          className:
            "px-2 sm:flex flex-1 hidden whitespace-nowrap overflow-hidden",
        },
        {
          Header: "Last Updated",
          accessor: "updatedDate",
          sortDescFirst: true,
          Cell: ({ value }) => DateTime.fromISO(value).toRelative(),
          className: "px-2 w-36 text-right",
        },
      ].filter(Boolean),
    []
  );

  const initialSort = useMemo(() => [{ id: "updatedDate", desc: true }], []);

  const fetchData = useCallback(
    async ({ pageSize, pageIndex, sortBy }) => {
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
            ...(moduleHash ? { moduleHash } : {}),
            ...(filters.hasCandid ? { hasCandid: filters.hasCandid } : {}),
            ...(filters.hasName ? { hasName: filters.hasName } : {}),
            ...(filters.hasModule ? { hasModule: filters.hasModule } : {}),
            ...(filters.hasController
              ? { hasController: filters.hasController }
              : {}),
            ...(subnetId ? { subnetId } : {}),
            pageSize,
            page: pageIndex,
          })
      );
      if (res) setResponse(res);
      setIsLoading(false);
    },
    [
      controllerId,
      moduleHash,
      subnetId,
      filters.hasCandid,
      filters.hasName,
      filters.hasModule,
      filters.hasController,
    ]
  );

  const toggleFilters = [
    { id: "hasName", label: "Canister Name" },
    { id: "hasCandid", label: "Interface" },
    !controllerId && { id: "hasController", label: "Controller" },
    !moduleHash && { id: "hasModule", label: "Module" },
  ].filter(Boolean);

  return (
    <section>
      <div className="py-2 flex flex-wrap gap-1">
        {!controllerId && (
          <select
            className="flex-1 p-1 bg-gray-100 dark:bg-gray-800 cursor-pointer"
            onChange={(e) =>
              setFilters((s) => ({ ...s, subnetId: e.target.value }))
            }
            value={subnetId}
          >
            <option value={""}>All Subnets</option>
            {subnets.length > 0
              ? subnets.map(({ displayName, id }) => (
                  <option key={id} value={id}>
                    {displayName}
                  </option>
                ))
              : null}
          </select>
        )}
        {toggleFilters.map(({ id, label }) => (
          <select
            key={id}
            className="flex-1 p-1 bg-gray-100 dark:bg-gray-800 cursor-pointer"
            onChange={(e) =>
              setFilters((s) => ({ ...s, [id]: e.target.value }))
            }
            value={filters[id]}
            style={{ minWidth: "8rem" }}
          >
            <option value="">{label}</option>
            <option value="1">With {label}</option>
            <option value="0">Without {label}</option>
          </select>
        ))}
      </div>
      <Table
        columns={columns}
        data={rows}
        count={count}
        fetchData={fetchData}
        loading={isLoading}
        initialSortBy={initialSort}
      />
    </section>
  );
};
