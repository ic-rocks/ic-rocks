import { DateTime } from "luxon";
import React from "react";
import useGovernanceMetrics from "../../lib/hooks/useGovernanceMetrics";
import { formatNumber } from "../../lib/numbers";
import BalanceLabel from "../Labels/BalanceLabel";
import { TimestampLabel } from "../Labels/TimestampLabel";
import SimpleTable from "../Tables/SimpleTable";

export default function GovernanceStats() {
  const { data: governanceMetrics } = useGovernanceMetrics();

  const summaryRows = [
    [
      {
        contents: "Total Neurons",
        className: "w-48",
      },
      {
        contents: governanceMetrics
          ? formatNumber(governanceMetrics.governance_neurons_total.value)
          : "-",
      },
    ],
    [
      {
        contents: "Total Voting Power",
        className: "w-48",
      },
      {
        contents: governanceMetrics
          ? `${formatNumber(
              governanceMetrics.governance_voting_power_total.value /
                BigInt(1e8)
            )} ×10⁸`
          : "-",
      },
    ],
    [
      {
        contents: "Latest Rewards Time",
        className: "w-48",
      },
      {
        contents: governanceMetrics ? (
          <TimestampLabel
            dt={DateTime.fromSeconds(
              Number(
                governanceMetrics
                  .governance_latest_reward_event_timestamp_seconds.value
              )
            )}
          />
        ) : (
          "-"
        ),
      },
    ],
    [
      {
        contents: "Latest Rewards Amount",
        className: "w-48",
      },
      {
        contents: governanceMetrics ? (
          <BalanceLabel
            value={governanceMetrics.governance_last_rewards_event_e8s.value}
          />
        ) : (
          "-"
        ),
      },
    ],
  ];

  const headers = [{ contents: "Summary", className: "flex-1" }];

  return <SimpleTable headers={headers} rows={summaryRows} />;
}
