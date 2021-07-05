import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import { BsArrowRight } from "react-icons/bs";
import { useQuery } from "react-query";
import fetchJSON from "../../lib/fetch";
import IdentifierLink from "../Labels/IdentifierLink";
import { Table } from "../Tables/Table";
import InfoBox from "./InfoBox";

export default function RecentCanistersBox() {
  const {
    data: { rows, count },
    isFetching,
  } = useQuery(
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
        accessor: "controllerId",
        Cell: ({ value, row }) => (
          <IdentifierLink
            type="principal"
            id={value}
            name={row.original.controller?.name}
          />
        ),
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
      <div className="flex xxs:flex-row flex-col justify-between items-baseline">
        <h3 className="text-lg xxs:mb-4">🛢 Recently Updated Canisters</h3>
        <Link href={`/canisters`}>
          <a className="text-xs link-overflow">
            view all <BsArrowRight className="ml-0.5 inline" />
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
