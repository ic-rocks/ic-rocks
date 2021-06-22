import classNames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { FiExternalLink } from "react-icons/fi";
import ActiveLink from "../components/ActiveLink";
import { MetaTags } from "../components/MetaTags";
import { SecondaryNav } from "../components/Nav/SecondaryNav";
import { SelectColumnFilter, Table } from "../components/Tables/Table";
import { entries } from "../lib/enums";
import fetchJSON from "../lib/fetch";
import { isUrl } from "../lib/strings";
import { Proposal, ProposalsResponse } from "../lib/types/API";
import {
  Action,
  NnsFunction,
  RewardStatus,
  Status,
  Topic,
} from "../lib/types/governance";

const renderSummary = (p: Proposal) => {
  if (p.action === Action["Approve Genesis KYC"]) {
    const data = JSON.parse(p.payloadJson);
    return (
      <ul className="text-xs">
        {data.map((pid) => (
          <li key={pid}>
            <Link href={`/principal/${pid}`}>
              <a className="link-overflow">{pid}</a>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  if (p.nnsFunction === NnsFunction["Set Authorized Subnetworks"]) {
    const data = JSON.parse(p.payloadJson);
    return (
      <div className="text-xs">
        <div>
          <label>Who</label>
          <ul>
            {data.who.map((pid) => (
              <li key={pid}>
                <Link href={`/principal/${pid}`}>
                  <a className="link-overflow">{pid}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <label>Subnets</label>
          <ul>
            {data.subnets.map((id) => (
              <li key={id}>
                <Link href={`/subnet/${id}`}>
                  <a className="link-overflow">{id}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return <pre className="text-xs mb-1">{p.payloadJson}</pre>;
};

const ProposalsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [{ rows, count }, setResponse] = useState<ProposalsResponse>({
    count: 0,
    rows: [],
  });
  const [proposers, setProposers] = useState(null);

  useEffect(() => {
    fetchJSON("/api/neurons/proposers").then(
      (data) => data && setProposers(data)
    );
  }, []);

  const columns = useMemo(
    () =>
      [
        {
          Header: "ID",
          accessor: "id",
          sortDescFirst: true,
          className: "px-2 w-14 oneline",
        },
        {
          Header: (
            <>
              Status /
              <br />
              Reward Status
            </>
          ),
          accessor: "status",
          disableSortBy: true,
          Cell: ({ value, row }) => (
            <div>
              <label
                className={classNames("block", {
                  "text-green-500": value === Status.Open,
                  "text-red-500":
                    value === Status.Rejected || value === Status.Failed,
                })}
              >
                {Status[value]}
              </label>
              <label
                className={classNames("block", {
                  "text-green-500":
                    row.original.rewardStatus ===
                      RewardStatus["Accept Votes"] &&
                    !(value === Status.Rejected || value === Status.Failed),
                  "text-red-500":
                    row.original.rewardStatus === RewardStatus.Ineligible,
                })}
              >
                {RewardStatus[row.original.rewardStatus]}
              </label>
            </div>
          ),
          className: "px-2 w-32",
          Filter: SelectColumnFilter,
          filterOptions: [["Status...", "" as any]].concat(entries(Status)),
        },
        {
          Header: "Proposer",
          accessor: "proposerId",
          Cell: ({ value, row }) => (
            <Link href={`/neuron/${value}`}>
              <a className="link-overflow">{value}</a>
            </Link>
          ),
          className: "px-2 w-24 overflow-hidden overflow-ellipsis",
          Filter: SelectColumnFilter,
          filterOptions: [["Proposer...", "" as any]].concat(
            proposers?.length > 0
              ? proposers.map(({ id, name, proposalCount }) => [
                  `${name || id} (${proposalCount})`,
                  id,
                ])
              : []
          ),
        },
        {
          Header: "Topic, Action & Summary",
          accessor: "topic",
          disableSortBy: true,
          Cell: ({ value, row }) => (
            <>
              <div>
                <strong>
                  <a
                    onClick={() => row.toggleRowExpanded(!row.isExpanded)}
                    className="link-overflow cursor-pointer flex items-center"
                  >
                    {row.isExpanded ? <BsChevronDown /> : <BsChevronRight />}
                    {Topic[value]}
                  </a>
                </strong>

                <p className="text-xs">
                  {Action[row.original.action]}
                  {row.original.nnsFunction &&
                    ` (${NnsFunction[row.original.nnsFunction]})`}
                </p>
                <p className="text-xs">{row.original.summary}</p>
              </div>
              {row.isExpanded && (
                <div className="overflow-auto text-xs">
                  {row.original.url && (
                    <>
                      <strong className="mr-2">URL</strong>
                      {isUrl(row.original.url) ? (
                        <a
                          href={row.original.url}
                          target="_blank"
                          className="inline-flex items-center oneline link-overflow"
                        >
                          {row.original.url} <FiExternalLink className="ml-1" />
                        </a>
                      ) : (
                        row.original.url
                      )}
                    </>
                  )}
                  {renderSummary(row.original)}
                </div>
              )}
            </>
          ),
          className: "px-2 flex-1 overflow-hidden",
          Filter: SelectColumnFilter,
          filterOptions: [["Topic...", "" as any]].concat(entries(Topic)),
        },
        {
          accessor: "action",
          hidden: true,
          Filter: SelectColumnFilter,
          filterOptions: [["Action...", "" as any]].concat(entries(Action)),
        },
        {
          accessor: "nnsFunction",
          hidden: true,
          Filter: SelectColumnFilter,
          filterOptions: [["NNS Function...", "" as any]].concat(
            entries(NnsFunction)
          ),
        },
        {
          Header: "Votes",
          accessor: "tallyTotal",
          disableSortBy: true,
          Cell: ({ value, row }) => {
            const tallyYes = BigInt(row.original.tallyYes);
            const tallyNo = BigInt(row.original.tallyNo);
            const sum = tallyYes + tallyNo;
            const open = row.original.status === Status.Open;

            return (
              <div>
                {Number(sum).toExponential(2)}
                {(open || tallyYes > tallyNo) && (
                  <span
                    className={classNames("block", {
                      "text-green-500": !(
                        row.original.status === Status.Rejected ||
                        row.original.status === Status.Failed
                      ),
                      "text-gray-500":
                        row.original.status === Status.Rejected ||
                        row.original.status === Status.Failed,
                    })}
                  >
                    {(Number((tallyYes * BigInt(10000)) / sum) / 100).toFixed(
                      2
                    )}
                    % Yes
                  </span>
                )}
                {(open || tallyYes < tallyNo) && (
                  <span className="block text-red-500">
                    {(Number((tallyNo * BigInt(10000)) / sum) / 100).toFixed(2)}
                    % No
                  </span>
                )}
              </div>
            );
          },
          className: "px-2 w-28",
        },
        {
          Header: "Proposal Date",
          accessor: "proposalDate",
          disableSortBy: true,
          Cell: ({ value }) => DateTime.fromISO(value).toRelative(),
          className: "px-2 w-32 text-right",
        },
      ].filter(Boolean),
    [proposers]
  );

  const initialSort = useMemo(() => [{ id: "id", desc: true }], []);

  const fetchData = useCallback(
    async ({ pageSize, pageIndex, sortBy, filters }) => {
      const topicFilter = filters.find(({ id }) => id === "topic");
      const statusFilter = filters.find(({ id }) => id === "status");
      const rewardStatusFilter = filters.find(
        ({ id }) => id === "rewardStatus"
      );
      const proposerIdFilter = filters.find(({ id }) => id === "proposerId");
      const actionFilter = filters.find(({ id }) => id === "action");
      const nnsFunctionFilter = filters.find(({ id }) => id === "nnsFunction");
      setIsLoading(true);
      const res = await fetchJSON(
        "/api/proposals?" +
          new URLSearchParams({
            ...(sortBy.length > 0
              ? {
                  orderBy: sortBy[0].id,
                  order: sortBy[0].desc ? "desc" : "asc",
                }
              : {}),
            ...(topicFilter ? { "topic[]": topicFilter.value } : {}),
            ...(statusFilter ? { "status[]": statusFilter.value } : {}),
            ...(rewardStatusFilter
              ? { "rewardStatus[]": rewardStatusFilter.value }
              : {}),
            ...(proposerIdFilter
              ? { "proposerId[]": proposerIdFilter.value }
              : {}),
            ...(actionFilter ? { "action[]": actionFilter.value } : {}),
            ...(nnsFunctionFilter
              ? { "nnsFunction[]": nnsFunctionFilter.value }
              : {}),
            pageSize,
            page: pageIndex,
          })
      );
      if (res) setResponse(res);
      setIsLoading(false);
    },
    []
  );

  return (
    <div className="pb-16">
      <MetaTags
        title="Proposals"
        description={`A list of governance proposals on the Internet Computer.`}
      />
      <SecondaryNav
        items={[
          <ActiveLink href="/proposals">Proposals</ActiveLink>,
          <ActiveLink href="/icp">ICP Price Oracle</ActiveLink>,
        ]}
      />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Proposals
      </h1>
      <section className="mb-8">
        <p>
          This collection is incomplete because proposals are deleted from the
          governance canister after being finalized.
        </p>
      </section>
      <section>
        <Table
          name="proposals"
          columns={columns}
          data={rows}
          count={count}
          fetchData={fetchData}
          loading={isLoading}
          initialSortBy={initialSort}
          useExpand={true}
          useFilter={true}
        />
      </section>
    </div>
  );
};

export default ProposalsPage;
