import Link from "next/link";
import React, { useMemo } from "react";
import NetworkGraph from "../components/Charts/NetworkGraph";
import { MetaTitle } from "../components/MetaTags";
import { Table } from "../components/Table";
import subnetsJson from "../generated/subnets.json";
import { getSubnetType } from "../lib/network";
import { formatNumber } from "../lib/numbers";

const Network = () => {
  const subnets = useMemo(
    () =>
      Object.entries(subnetsJson.subnets).map(
        ([id, { membership, subnetType }]) => ({
          id,
          nodeCount: membership.length,
          subnetType,
        })
      ),
    []
  );
  const title = "Network";

  const columns = useMemo(
    () => [
      {
        Header: "Type",
        accessor: "subnetType",
        Cell: ({ value }) => getSubnetType(value),
        className: "px-2 w-40",
      },
      {
        Header: `Subnet (${subnets.length})`,
        accessor: "id",
        Cell: ({ value }) => (
          <Link href={`/subnet/${value}`}>
            <a className="link-overflow">{value}</a>
          </Link>
        ),
        className: "px-2 flex flex-1 whitespace-nowrap overflow-hidden",
      },
      {
        Header: "Nodes",
        accessor: "nodeCount",
        sortDescFirst: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-2 w-24 text-right",
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "subnetType", desc: false }], []);

  return (
    <div className="py-16">
      <MetaTitle title={title} />
      <h1 className="text-3xl mb-8">{title}</h1>
      <NetworkGraph />
      <section>
        <Table
          data={subnets}
          columns={columns}
          count={subnets.length}
          initialSortBy={initialSort}
          manualPagination={false}
          manualSortBy={false}
        />
      </section>
    </div>
  );
};

export default Network;
