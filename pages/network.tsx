import Link from "next/link";
import React, { useMemo } from "react";
import NetworkGraph from "../components/Charts/NetworkGraph";
import { MetaTags } from "../components/MetaTags";
import { Table } from "../components/Tables/Table";
import useSubnets from "../lib/hooks/useSubnets";
import { getSubnetType } from "../lib/network";
import { formatNumber } from "../lib/numbers";

const Network = () => {
  const { data, isFetching } = useSubnets();

  const title = "Network";

  const columns = useMemo(
    () => [
      {
        Header: "Type",
        accessor: "subnetType",
        Cell: ({ value }) => getSubnetType(value),
        className: "px-2 w-24 sm:w-40",
      },
      {
        Header: "Subnet ID",
        accessor: "id",
        Cell: ({ value }) => (
          <Link href={`/subnet/${value}`}>
            <a className="link-overflow">{value}</a>
          </Link>
        ),
        style: { minWidth: "8rem" },
        disableSortBy: true,
        className: "px-2 flex flex-1 oneline",
      },
      {
        Header: "Nodes",
        accessor: "nodeCount",
        sortDescFirst: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-2 w-24 text-right",
      },
      {
        Header: "Canisters",
        accessor: "canisterCount",
        sortDescFirst: true,
        Cell: ({ value }) => formatNumber(value),
        className: "px-2 hidden xs:block w-28 text-right",
      },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "subnetType", desc: false }], []);

  return (
    <div className="pb-16">
      <MetaTags
        title={title}
        description="An overview of the Internet Computer network. View subnets, nodes, operators, and providers."
      />
      <h1 className="text-3xl my-8">{title}</h1>
      <NetworkGraph />
      <section className="pt-8">
        <h2 className="text-2xl mb-4">
          {isFetching ? "⁠—" : data.length} Subnets
        </h2>
        <Table
          data={data}
          columns={columns}
          count={data.length}
          loading={isFetching}
          initialSortBy={initialSort}
          manualPagination={false}
          manualSortBy={false}
        />
      </section>
    </div>
  );
};

export default Network;
