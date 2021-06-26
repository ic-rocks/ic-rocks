import { DateTime } from "luxon";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { entries } from "../../lib/enums";
import fetchJSON from "../../lib/fetch";
import { NeuronsResponse } from "../../lib/types/API";
import { NeuronState } from "../../lib/types/governance";
import BalanceLabel from "../Labels/BalanceLabel";
import { SelectColumnFilter, Table } from "../Tables/Table";
import { NeuronLabel } from "./NeuronLabel";

const NeuronsTable = ({
  name,
  genesisAccount,
  onFetch,
}: {
  name?: string;
  genesisAccount?: string;
  onFetch?: (res?) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [{ rows, count }, setResponse] = useState<NeuronsResponse>({
    count: 0,
    rows: [],
  });

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        className: "px-2 flex-1 oneline",
        Cell: ({ value, row }) => (
          <>
            <Link href={`/neuron/${value}`}>
              <a className="link-overflow">{value}</a>
            </Link>
            {row.original.name && (
              <span
                className="ml-1"
                aria-label={row.original.name}
                data-balloon-pos="right"
                data-balloon-length="xlarge"
              >
                <BsInfoCircle className="inline text-xs align-middle" />
              </span>
            )}
          </>
        ),
        style: { minWidth: "4rem" },
        Filter: SelectColumnFilter,
        filterOptions: [
          ["Genesis...", ""],
          ["Is Genesis", "1"],
          ["Is not Genesis", "0"],
        ],
      },
      {
        Header: "State",
        accessor: "state",
        Cell: ({ value, row }) => <NeuronLabel state={value} />,
        className: "px-2 w-24",
        Filter: SelectColumnFilter,
        filterOptions: [["State...", "" as any]].concat(
          entries(NeuronState).filter(([_, n]) => n > 0)
        ),
      },
      {
        Header: "Proposals",
        accessor: "proposalCount",
        sortDescFirst: true,
        className: "px-2 hidden sm:block w-28 text-right",
        Filter: SelectColumnFilter,
        filterOptions: [
          ["Proposals...", ""],
          ["Has Proposals", "1"],
          ["No Proposals", "0"],
        ],
      },
      {
        Header: "Account",
        accessor: "accountId",
        Cell: ({ value, row }) =>
          value ? (
            <Link href={`/account/${value}`}>
              <a className="link-overflow">{value}</a>
            </Link>
          ) : (
            <span className="text-gray-500">Unknown</span>
          ),
        className: "px-2 flex-1 flex oneline",
        style: { minWidth: "6rem" },
      },
      {
        Header: "Staked ICP",
        accessor: "stake",
        sortDescFirst: true,
        disableSortBy: !!genesisAccount,
        Cell: ({ value, row }) => (
          <BalanceLabel
            value={
              row.original.account &&
              row.original.state === NeuronState.Dissolved
                ? row.original.account.balance
                : value
            }
          />
        ),
        className: "px-2 w-40 text-right",
      },
      {
        Header: "Dissolve Date",
        accessor: "dissolveDate",
        Cell: ({ value, row }) => {
          if (row.original.state === NeuronState.Dissolved) return "-";
          const date = DateTime.fromISO(value);
          return date.diffNow().toMillis() < 0
            ? "Dissolvable"
            : date.toRelative();
        },
        className: "px-2 w-36 text-right",
      },
    ],
    []
  );

  const initialSort = useMemo(
    () => [
      genesisAccount
        ? { id: "dissolveDate", desc: false }
        : { id: "stake", desc: true },
    ],
    []
  );

  const fetchData = useCallback(
    async ({ pageSize, pageIndex, sortBy, filters }) => {
      const stateFilter = filters.find(({ id }) => id === "state");
      const proposalFilter = filters.find(({ id }) => id === "proposalCount");
      const genesisFilter = filters.find(({ id }) => id === "id");
      setIsLoading(true);
      const res = await fetchJSON(
        "/api/neurons?" +
          new URLSearchParams({
            ...(genesisAccount ? { genesisAccount } : {}),
            ...(sortBy.length > 0
              ? {
                  orderBy: sortBy[0].id,
                  order: sortBy[0].desc ? "desc" : "asc",
                }
              : {}),
            pageSize,
            page: pageIndex,
            ...(stateFilter ? { state: stateFilter.value } : {}),
            ...(proposalFilter ? { hasProposals: proposalFilter.value } : {}),
            ...(genesisFilter ? { isGenesis: genesisFilter.value } : {}),
          })
      );
      if (onFetch) onFetch(res);
      if (res) setResponse(res);
      setIsLoading(false);
    },
    []
  );

  return (
    <Table
      name={`${name}.neurons`}
      style={{ minWidth: 480 }}
      className="text-xs sm:text-base"
      columns={columns}
      data={rows}
      count={count}
      fetchData={fetchData}
      loading={isLoading}
      initialSortBy={initialSort}
      useExpand={true}
      initialPageSize={genesisAccount ? 50 : undefined}
      useFilter={true}
    />
  );
};

export default NeuronsTable;
