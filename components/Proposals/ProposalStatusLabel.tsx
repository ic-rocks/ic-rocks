import classNames from "classnames";
import React from "react";
import { RewardStatus, Status } from "../../lib/types/governance";

export function ProposalStatusLabel({ status }: { status: Status }) {
  return (
    <label
      className={classNames({
        "text-green-500": status === Status.Open,
        "text-red-500": status === Status.Rejected || status === Status.Failed,
      })}
    >
      {Status[status]}
    </label>
  );
}

export function ProposalRewardStatusLabel({
  rewardStatus,
  status,
}: {
  rewardStatus: RewardStatus;
  status: Status;
}) {
  return (
    <label
      className={classNames({
        "text-green-500":
          rewardStatus === RewardStatus["Accept Votes"] &&
          !(status === Status.Rejected || status === Status.Failed),
        "text-red-500": rewardStatus === RewardStatus.Ineligible,
      })}
    >
      {RewardStatus[rewardStatus]}
    </label>
  );
}
