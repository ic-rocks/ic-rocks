import classNames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { useQuery } from "react-query";
import BalanceLabel from "../../components/Labels/BalanceLabel";
import { TimestampLabel } from "../../components/Labels/TimestampLabel";
import { MetaTags } from "../../components/MetaTags";
import {
  ProposalRewardStatusLabel,
  ProposalStatusLabel,
} from "../../components/Proposals/ProposalStatusLabel";
import { ProposalSummary } from "../../components/Proposals/ProposalSummary";
import { ProposalUrl } from "../../components/Proposals/ProposalUrl";
import SimpleTable from "../../components/Tables/SimpleTable";
import fetchJSON from "../../lib/fetch";
import { Proposal } from "../../lib/types/API";
import { Action, NnsFunction, Topic } from "../../lib/types/governance";
import Votes from "./Votes";

const ProposalIdPage = () => {
  const router = useRouter();
  const { proposalId } = router.query as { proposalId: string };
  const { data } = useQuery<Proposal>(
    ["proposals", proposalId],
    () => fetchJSON(`/api/proposals/${proposalId}`),
    { enabled: !!proposalId }
  );

  const headers = [{ contents: "Proposal Details" }];

  const summaryRows = useMemo(() => {
    return [
      [
        { contents: "Topic", className: "w-36" },
        {
          contents: data ? Topic[data.topic] : "-",
        },
      ],
      [
        { contents: "Action", className: "w-36" },
        {
          contents: data ? (
            <>
              {Action[data.action]}
              {data.nnsFunction && ` (${NnsFunction[data.nnsFunction]})`}
            </>
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Proposer", className: "w-36" },
        {
          contents: data ? (
            <Link href={`/neuron/${data.proposerId}`}>
              <a className="link-overflow">{data.proposerId}</a>
            </Link>
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Proposal Status", className: "w-36" },
        {
          contents: data ? <ProposalStatusLabel status={data.status} /> : "-",
        },
      ],
      [
        { contents: "Reward Status", className: "w-36" },
        {
          contents: data ? (
            <>
              <ProposalRewardStatusLabel
                status={data.status}
                rewardStatus={data.rewardStatus}
              />
              {data.rewardEventRound > 0
                ? ` (Reward Event Round ${data.rewardEventRound})`
                : null}
            </>
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Proposal Date", className: "w-36" },
        {
          contents: data ? (
            <TimestampLabel dt={DateTime.fromISO(data.proposalDate)} />
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Decided Date", className: "w-36" },
        {
          contents: data?.decidedDate ? (
            <TimestampLabel dt={DateTime.fromISO(data.decidedDate)} />
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Executed Date", className: "w-36" },
        {
          contents: data?.executedDate ? (
            <TimestampLabel dt={DateTime.fromISO(data.executedDate)} />
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Failed Date", className: "w-36" },
        {
          contents: data?.failedDate ? (
            <TimestampLabel dt={DateTime.fromISO(data.failedDate)} />
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Reject Cost", className: "w-36" },
        {
          contents: data ? <BalanceLabel value={data.rejectCost} /> : "-",
        },
      ],
      [
        { contents: "URL", className: "w-36" },
        {
          contents: data ? <ProposalUrl url={data.url} /> : "-",
          className: classNames("overflow-hidden", {
            "text-xs self-end": data?.url?.length > 50,
          }),
        },
      ],
      [
        { contents: "Summary", className: "w-36" },
        {
          contents: data ? data.summary : "-",
          className: "sm:flex-1 break-word overflow-hidden",
        },
      ],
      [
        { contents: "Payload", className: "w-36" },
        {
          contents: data ? <ProposalSummary proposal={data} /> : "-",
        },
      ],
    ];
  }, [data]);

  return (
    <div className="pb-16">
      <MetaTags
        title={`Proposal${proposalId ? ` ${proposalId}` : ""}`}
        description={`Details for Proposal${
          proposalId ? ` ${proposalId}` : ""
        } on the Internet Computer ledger.`}
      />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Proposal <small className="text-xl break-all">{proposalId}</small>
      </h1>
      <section className="flex flex-col gap-4">
        <div>
          <div className="p-2 bg-heading font-bold">Votes</div>
          {!!data && <Votes data={data} />}
        </div>
        <SimpleTable headers={headers} rows={summaryRows} />
      </section>
    </div>
  );
};

export default ProposalIdPage;
