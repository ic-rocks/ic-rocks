import React from "react";
import { formatNumber } from "../../lib/numbers";
import { formatPercent } from "../../lib/strings";
import { Proposal } from "../../lib/types/API";

export default function Votes({ data }: { data: Proposal }) {
  const tallyTotal = BigInt(data.tallyTotal);
  const tallyTotalNumber = Number(BigInt(data.tallyTotal) / BigInt(1e8));
  const tallyYes = BigInt(data.tallyYes);
  const percentYes = Number(tallyYes / BigInt(1e8)) / tallyTotalNumber;
  const tallyNo = BigInt(data.tallyNo);
  const percentNo = Number(tallyNo / BigInt(1e8)) / tallyTotalNumber;
  const tallyAbstain = tallyTotal - tallyYes - tallyNo;
  const percentAbstain = Number(tallyAbstain / BigInt(1e8)) / tallyTotalNumber;

  return (
    <div className="p-2 text-xs md:text-base">
      <div className="flex py-0.5">
        <div className="w-16">Yes</div>
        <div className="pr-2 w-20 md:w-28 text-right">
          {formatNumber(tallyYes / BigInt(1e8))}
        </div>
        <div className="flex-1">
          <div
            className="relative h-full bg-green-400 dark:bg-green-600 rounded"
            style={{ width: `${percentYes * 100}%` }}
          >
            <div className="absolute pl-2">{formatPercent(percentYes)}</div>
          </div>
        </div>
      </div>
      <div className="flex py-0.5">
        <div className="w-16">No</div>
        <div className="pr-2 w-20 md:w-28 text-right">
          {formatNumber(tallyNo / BigInt(1e8))}
        </div>
        <div className="flex-1">
          <div
            className="relative h-full bg-red-400 dark:bg-red-600 rounded"
            style={{ width: `${percentNo * 100}%` }}
          >
            <div className="absolute pl-2">{formatPercent(percentNo)}</div>
          </div>
        </div>
      </div>
      <div className="flex py-0.5">
        <div className="w-16 text-gray-500">No Vote</div>
        <div className="pr-2 w-20 md:w-28 text-right">
          {formatNumber(tallyAbstain / BigInt(1e8))}
        </div>
        <div className="flex-1">
          <div
            className="relative h-full bg-gray-500 rounded"
            style={{ width: `${percentAbstain * 100}%` }}
          >
            <div className="absolute pl-2">{formatPercent(percentAbstain)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
