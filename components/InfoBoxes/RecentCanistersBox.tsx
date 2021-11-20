import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import { BsArrowRight } from "react-icons/bs";
import { useQuery } from "react-query";
import fetchJSON from "../../lib/fetch";
import { CanistersResponse } from "../../lib/types/API";
import IdentifierLink from "../Labels/IdentifierLink";
import { Table } from "../Tables/Table";
import InfoBox from "./InfoBox";

export default function RecentCanistersBox() {
  const {
    data: { rows, count },
    isFetching,
  } = useQuery<CanistersResponse>(
    "recent-canisters",
    () =>
      fetchJSON(
        "/api/canisters?" +
          new URLSearchParams({
            pageSize: "5",
          })
      ),
    {
      placeholderData: { rows: [], count: 0 },
      refetchInterval: 60 * 1000,
    }
  );

  const columns = useMemo(
    () => [
      {
        Header: "Canister",
        id: "id",
        accessor: "id",
        Cell: ({ value, row }) => {
          return (
            <IdentifierLink
              type="principal"
              id={value}
              name={row.original.principal?.name}
            />
          );
        },
        className: "px-2 flex-1 flex oneline",
      },
      {
        Header: "Controller",
        accessor: "controllers",
        Cell: ({ value }) =>
          value.length <= 1
            ? value.map(({ id, name }) => (
                <IdentifierLink
                  key={id}
                  className="flex-1"
                  type="principal"
                  id={id}
                  name={name}
                />
              ))
            : `${value.length} controllers`,
        className: "px-2 sm:flex flex-1 hidden oneline",
      },
      {
        Header: "Last Updated",
        accessor: "latestVersionDate",
        Cell: ({ value }) => DateTime.fromISO(value).toRelative(),
        className: "px-2 w-36 text-right",
      },
    ],
    []
  );

  return (
    <InfoBox>
      <div className="flex flex-col xxs:flex-row justify-between items-baseline">
        <h3 className="xxs:mb-4 text-lg">🛢 Recently Updated Canisters</h3>
        <Link href={`/canisters`}>
          <a className="text-xs link-overflow">
            view all <BsArrowRight className="inline ml-0.5" />
          </a>
        </Link>
      </div>
      <Table
        tableHeaderGroupProps={{
          className: "bg-heading py-0.5",
        }}
        columns={columns}
        data={rows}
        count={count}
        loading={!count && isFetching}
        useSort={false}
        usePage={false}
      />
    </InfoBox>
  );
}
