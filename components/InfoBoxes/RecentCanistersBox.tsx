import { DateTime } from "luxon";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import fetchJSON from "../../lib/fetch";
import { CanistersResponse } from "../../lib/types/API";
import { Table } from "../Tables/Table";
import InfoBox from "./InfoBox";

export default function RecentCanistersBox({}: {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [{ rows, count }, setResponse] = useState<CanistersResponse>({
    count: 0,
    rows: [],
  });
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await fetchJSON(
      "/api/canisters?" +
        new URLSearchParams({
          pageSize: "5",
        })
    );
    if (res) setResponse(res);
    setIsLoading(false);
  }, []);
  const columns = useMemo(
    () => [
      {
        Header: "Canister",
        id: "id",
        accessor: "id",
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
      },
      {
        Header: "Controller",
        accessor: "controllerId",
        Cell: ({ value, row }) => (
          <Link href={`/principal/${value}`}>
            <a className="link-overflow">
              {row.original.controller?.name || value}
            </a>
          </Link>
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
        fetchData={fetchData}
        loading={isLoading}
        useSort={false}
        usePage={false}
      />
    </InfoBox>
  );
}
