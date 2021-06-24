import classNames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
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
import { formatNumber } from "../../lib/numbers";
import { formatPercent } from "../../lib/strings";
import { Proposal } from "../../lib/types/API";
import { Action, NnsFunction, Topic } from "../../lib/types/governance";

const ProposalIdPage = () => {
  const router = useRouter();
  const { proposalId } = router.query as { proposalId: string };
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Proposal>(null);

  useEffect(() => {
    if (!proposalId) return;

    fetchJSON(`/api/proposals/${proposalId}`).then((data) => {
      if (data) {
        setData(data);
      }
      setIsLoading(false);
    });
  }, [proposalId]);

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
          contents: data ? (
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
          className: classNames({ "text-xs self-end": data?.url?.length > 50 }),
        },
      ],
      [
        { contents: "Summary", className: "w-36" },
        {
          contents: data ? <ProposalSummary proposal={data} /> : "-",
        },
      ],
    ];
  }, [data]);
  let tally;
  if (data) {
    const tallyTotal = BigInt(data.tallyTotal);
    const tallyTotalNumber = Number(BigInt(data.tallyTotal) / BigInt(1e8));
    const tallyYes = BigInt(data.tallyYes);
    const percentYes = Number(tallyYes / BigInt(1e8)) / tallyTotalNumber;
    const tallyNo = BigInt(data.tallyNo);
    const percentNo = Number(tallyNo / BigInt(1e8)) / tallyTotalNumber;
    const tallyAbstain = tallyTotal - tallyYes - tallyNo;
    const percentAbstain =
      Number(tallyAbstain / BigInt(1e8)) / tallyTotalNumber;
    tally = (
      <div className="p-2 text-xs md:text-base">
        <div className="flex py-0.5">
          <div className="w-16">Yes</div>
          <div className="w-20 md:w-28 pr-2 text-right">
            {formatNumber(tallyYes / BigInt(1e8))}
          </div>
          <div className="flex-1">
            <div
              className="relative rounded bg-green-400 dark:bg-green-600 h-full"
              style={{ width: `${percentYes * 100}%` }}
            >
              <div className="absolute pl-2">{formatPercent(percentYes)}</div>
            </div>
          </div>
        </div>
        <div className="flex py-0.5">
          <div className="w-16">No</div>
          <div className="w-20 md:w-28 pr-2 text-right">
            {formatNumber(tallyNo / BigInt(1e8))}
          </div>
          <div className="flex-1">
            <div
              className="relative rounded bg-red-400 dark:bg-red-600 h-full"
              style={{ width: `${percentNo * 100}%` }}
            >
              <div className="absolute pl-2">{formatPercent(percentNo)}</div>
            </div>
          </div>
        </div>
        <div className="flex py-0.5">
          <div className="w-16 text-gray-500">No Vote</div>
          <div className="w-20 md:w-28 pr-2 text-right">
            {formatNumber(tallyAbstain / BigInt(1e8))}
          </div>
          <div className="flex-1">
            <div
              className="relative rounded bg-gray-500 h-full"
              style={{ width: `${percentAbstain * 100}%` }}
            >
              <div className="absolute pl-2">
                {formatPercent(percentAbstain)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {tally}
        </div>
        <SimpleTable headers={headers} rows={summaryRows} />
      </section>
    </div>
  );
};

export default ProposalIdPage;
