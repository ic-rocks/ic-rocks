import classNames from "classnames";
import { DateTime } from "luxon";
import React, { useEffect, useMemo, useState } from "react";
import BalanceLabel from "../../components/Labels/BalanceLabel";
import { MetaTags } from "../../components/MetaTags";
import NeuronNav from "../../components/Neurons/NeuronNav";
import { useGlobalState } from "../../components/StateContext";
import { Table } from "../../components/Tables/Table";
import { formatDuration } from "../../lib/datetime";
import fetchJSON from "../../lib/fetch";
import { formatPercent } from "../../lib/strings";
import { NeuronAllocation } from "../../lib/types/API";

const NEURON_ID_LABELS = {
  "1 - 81": "Team",
  "29 - 29": "Genesis Donation",
  "200 - 256": "Node Operator Bonus",
  "1000 - 1141": "",
  "2000 - 2055": "",
  "3000 - 3039": "Internet Computer Association",
  "4000 - 4000": "",
  "4001 - 4037": "",
};

const NeuronAllocationsPage = () => {
  const { stats } = useGlobalState();
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setResponse] = useState<NeuronAllocation[]>([]);

  useEffect(() => {
    fetchJSON("/api/neurons/groups").then((data) => {
      if (data) {
        setResponse(data);
      }
      setIsLoading(false);
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "Neuron IDs / Labels",
        accessor: "name",
        Cell: ({ value, row }) => (
          <div className="flex flex-col">
            <label className={classNames({ "font-bold": value === "Total" })}>
              {value}
            </label>
            <label>{NEURON_ID_LABELS[row.original.name]}</label>
          </div>
        ),
        className: "px-2 w-64 oneline",
      },
      {
        Header: "Count",
        accessor: "count",
        className: "pl-2 pr-8 w-24 text-right",
      },
      {
        Header: "ICP",
        accessor: "originalStake",
        Cell: ({ value, row }) => {
          const originalPercent = stats
            ? formatPercent(
                row.original.name === "Total"
                  ? 1
                  : Number(BigInt(value) / BigInt(1e8)) /
                      Number(BigInt(stats.supply) / BigInt(1e8))
              )
            : "-";
          const current =
            row.original.name === "Total" ? stats?.supply : row.original.stake;
          return (
            <div className="flex flex-col">
              <div className="flex">
                <label className="w-12">Initial</label>
                <div className="w-44 text-right">
                  <BalanceLabel value={value} />
                </div>
                <div
                  className={classNames("w-20 text-right", {
                    "text-gray-500": value === "0",
                  })}
                >
                  {originalPercent}
                </div>
              </div>
              <div className="flex">
                <label className="w-12">Current</label>
                <div className="w-44 text-right">
                  <BalanceLabel value={current} digits={0} />
                </div>
              </div>
            </div>
          );
        },
        className: "pl-2 pr-8 flex-1",
      },
      {
        Header: "Dissolve Delay",
        accessor: "minDissolveDate",
        Cell: ({ value, row }) => {
          if (row.original.name === "Total") return null;

          const minDuration = DateTime.fromISO(value).diffNow([
            "years",
            "months",
            "days",
          ]);
          const min =
            minDuration.toMillis() < 0 ? "-" : formatDuration(minDuration);

          const maxDuration = DateTime.fromISO(
            row.original.maxDissolveDate
          ).diffNow(["years", "months", "days"]);
          const max =
            maxDuration.toMillis() < 0 ? "-" : formatDuration(maxDuration);
          return (
            <div className="flex flex-col">
              <div>
                <label className="inline-block w-10">Min</label>
                {min}
              </div>
              <div>
                <label className="inline-block w-10">Max</label>
                {max}
              </div>
            </div>
          );
        },
        className: "px-2 w-64",
      },
    ],
    []
  );

  return (
    <div className="pb-16">
      <MetaTags
        title="Initial Neuron Allocations"
        description={`Overview of initial neuron allocations on the Internet Computer.`}
      />
      <NeuronNav />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Initial Neuron Allocations
      </h1>

      <Table
        className="text-xs md:text-sm lg:text-base"
        columns={columns}
        data={rows}
        count={rows.length}
        loading={isLoading}
        useExpand={true}
        useSort={false}
        usePage={false}
      />
    </div>
  );
};

export default NeuronAllocationsPage;
