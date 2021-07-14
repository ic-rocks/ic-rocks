import { curveMonotoneX } from "d3";
import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import ContentLoader from "react-content-loader";
import { FiChevronRight } from "react-icons/fi";
import useTransactionCounts from "../../lib/hooks/useTransactionCounts";
import { formatNumber } from "../../lib/numbers";
import MultiLineChart from "../Charts/MultiLineChart";

const TransactionsOverTimeChart = ({
  isFull = false,
}: {
  isFull?: boolean;
}) => {
  const { data } = useTransactionCounts();
  const heading = "ICP Transactions over Time";

  const series = useMemo(() => {
    if (!data) return null;
    return data.reduce(
      ([counts, sums], d) => {
        const x = DateTime.fromISO(d.day).toJSDate();
        return [
          counts.concat({
            x,
            y: d.count,
          }),
          sums.concat({
            x,
            y: Number(d.sum),
          }),
        ];
      },
      [[], []]
    );
  }, [data]);

  const height = isFull ? 400 : 250;

  return (
    <div className="bg-gray-100 dark:bg-gray-850 p-4 shadow-md rounded-md">
      <div className="flex flex-col" style={{ minHeight: height }}>
        {data ? (
          <>
            {!isFull && (
              <Link href={`/charts/transactions`}>
                <a className="font-bold link-overflow inline-flex items-center">
                  {heading} <FiChevronRight />
                </a>
              </Link>
            )}
            <MultiLineChart
              data={series}
              xTooltipFormat={(x) =>
                DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL)
              }
              yTooltipFormat={(i, { y }) =>
                `${i === 0 ? "Count" : "Sum"}: ${formatNumber(y, 2)}`
              }
              height={height}
              curve={curveMonotoneX}
            />
          </>
        ) : (
          <ContentLoader
            uniqueKey={`charts.network-counts.transactions`}
            className="w-full"
            width={100}
            height={height}
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
          >
            {isFull ? (
              <rect x="0" y="0" rx="2" ry="2" width="100%" height={height} />
            ) : (
              <>
                <rect x="0" y="4" rx="2" ry="2" width="50%" height="16" />
                <rect x="0" y="24" rx="2" ry="2" width="100%" height={height} />
              </>
            )}
          </ContentLoader>
        )}
      </div>
    </div>
  );
};

export default TransactionsOverTimeChart;
