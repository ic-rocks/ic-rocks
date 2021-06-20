import { DateTime } from "luxon";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import { entries } from "../lib/enums";
import fetchJSON from "../lib/fetch";
import { NeuronsResponse } from "../lib/types/API";
import { NeuronState } from "../lib/types/governance";
import BalanceLabel from "./Labels/BalanceLabel";
import { NeuronLabel } from "./Neurons";
import { Table } from "./Tables/Table";

const NeuronsTable = ({
  genesisAccount,
  onFetch,
}: {
  genesisAccount?: string;
  onFetch?: (res?) => void;
}) => {
  const [{ ...filters }, setFilters] = useState({
    state: "",
    hasProposals: "",
    isGenesis: "",
  });
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
        className: "px-2 w-48 oneline",
      },
      {
        Header: "State",
        accessor: "state",
        Cell: ({ value, row }) => <NeuronLabel state={value} />,
        className: "px-2 w-20",
      },
      {
        Header: "Proposals",
        accessor: "proposalCount",
        sortDescFirst: true,
        className: "px-2 w-28 text-right",
      },
      {
        Header: "Account",
        accessor: "accountId",
        Cell: ({ value, row }) => (
          <Link href={`/account/${value}`}>
            <a className="link-overflow">{value}</a>
          </Link>
        ),
        className: "px-2 flex-1 flex oneline",
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
                : row.original.originalStake != "0"
                ? row.original.originalStake
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
          if (
            row.original.state === NeuronState.Dissolved ||
            DateTime.fromISO(row.original.createdDate).toSeconds() === 0
          )
            return "-";
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
    async ({ pageSize, pageIndex, sortBy }) => {
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
            ...(filters.state ? { state: filters.state } : {}),
            ...(filters.hasProposals
              ? { hasProposals: filters.hasProposals }
              : {}),
            ...(filters.isGenesis ? { isGenesis: filters.isGenesis } : {}),
          })
      );
      if (onFetch) onFetch(res);
      if (res) setResponse(res);
      setIsLoading(false);
    },
    [filters.state, filters.hasProposals, filters.isGenesis]
  );

  const toggleFilters = genesisAccount
    ? []
    : [
        {
          id: "state",
          label: "State",
          options: [["State...", "" as any]].concat(
            entries(NeuronState).filter(([_, n]) => n > 0)
          ),
        },
        {
          id: "hasProposals",
          label: "hasProposals",
          options: [
            ["Proposals...", ""],
            ["Has Proposals", "1"],
            ["No Proposals", "0"],
          ],
        },
        {
          id: "isGenesis",
          label: "isGenesis",
          options: [
            ["Genesis...", ""],
            ["Is Genesis", "1"],
            ["Is not Genesis", "0"],
          ],
        },
      ];

  return (
    <section>
      <div className="py-2 flex flex-wrap gap-1">
        {toggleFilters.map(({ id, label, options }) => (
          <select
            key={id}
            className="flex-1 p-1 bg-gray-100 dark:bg-gray-800 cursor-pointer"
            onChange={(e) =>
              setFilters((s) => ({ ...s, [id]: e.target.value }))
            }
            value={filters[id]}
            style={{ minWidth: "8rem" }}
          >
            {options.map(([name, value]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
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
        useExpand={true}
        initialPageSize={genesisAccount ? 50 : undefined}
      />
    </section>
  );
};

export default NeuronsTable;
