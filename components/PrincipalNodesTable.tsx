import Link from "next/link";
import React, { useMemo } from "react";
import { countBy } from "../lib/arrays";
import { capitalize } from "../lib/strings";
import { APIPrincipal } from "../lib/types/API";
import PrincipalLink from "./Labels/PrincipalLink";
import { Table } from "./Tables/Table";

export const PrincipalNodesTable = ({ data }: { data: APIPrincipal }) => {
  const [myRole, otherRole, rows] = useMemo(
    () =>
      data.operatorOf.length > 0
        ? ["operator", "provider", data.operatorOf]
        : ["provider", "operator", data.providerOf],
    [data]
  );

  const columns = useMemo(
    () => [
      {
        Header: `${capitalize(myRole)} of Nodes (${rows.length})`,
        accessor: "id",
        Cell: ({ value, row }) => {
          return (
            <Link href={`/node/${value}`}>
              <a className="link-overflow">
                {row.original.principal.name || value}
              </a>
            </Link>
          );
        },
        className: "px-2 flex-1 flex oneline",
      },
      {
        Header: `Subnet (${countBy(rows, (d) => d.subnet.id)} unique)`,
        id: "subnet",
        accessor: (d) => d.subnet.displayName,
        Cell: ({ value, row }) => (
          <Link href={`/subnet/${row.original.subnet.id}`}>
            <a className="link-overflow">{value}</a>
          </Link>
        ),
        className: "px-2 flex-1 flex oneline",
      },
      {
        Header: `${capitalize(otherRole)} (${countBy(
          rows,
          (d) => d[otherRole].id
        )} unique)`,
        id: "other",
        accessor: (d) => d[otherRole].id,
        Cell: ({ value, row }) => (
          <PrincipalLink
            principalId={value}
            name={row.original[otherRole].name}
          />
        ),
        className: "px-2 flex-1 flex oneline",
      },
    ],
    [rows]
  );

  return (
    <Table
      columns={columns}
      data={rows}
      count={rows.length}
      usePage={false}
      manualSortBy={false}
      initialSortBy={[{ id: "subnet", desc: false }]}
    />
  );
};
