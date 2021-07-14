import { DateTime } from "luxon";
import Link from "next/link";
import React, { useMemo } from "react";
import ContentLoader from "react-content-loader";
import { FiChevronRight } from "react-icons/fi";
import { formatNumber } from "../../lib/numbers";
import LineBarChart from "../Charts/LineBarChart";
import { ChartId, ChartTypes } from "./ChartIds";
import TransactionsOverTimeChart from "./TransactionsOverTimeChart";

const DataOverTimeChart = ({
  chartId,
  isFull = false,
}: {
  chartId: ChartId;
  isFull?: boolean;
}) => {
  const { hook, dataKey, heading, curve } = ChartTypes.find(
    ({ id }) => id === chartId
  );

  if (chartId === "transactions") {
    return <TransactionsOverTimeChart heading={heading} isFull={isFull} />;
  }

  const { data } = hook();

  const series = useMemo(() => {
    let sum = 0;
    return data
      ?.map((d) => {
        sum += d[dataKey];
        return {
          x: DateTime.fromISO(d.day).toJSDate(),
          y1: d[dataKey],
          y2: sum,
        };
      })
      .concat({
        x: new Date(),
        y1: 0,
        y2: sum,
      });
  }, [data]);

  const height = isFull ? 400 : 250;

  return (
    <div className="bg-gray-100 dark:bg-gray-850 p-4 shadow-md rounded-md">
      <div className="flex flex-col" style={{ minHeight: height }}>
        {data ? (
          <>
            {!isFull && (
              <Link href={`/charts/${chartId}`}>
                <a className="font-bold link-overflow inline-flex items-center">
                  {heading} <FiChevronRight />
                </a>
              </Link>
            )}
            <LineBarChart
              data={series}
              xTooltipFormat={(x) =>
                DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL)
              }
              y1TooltipFormat={({ y1 }) => `New: ${formatNumber(y1)}`}
              y2TooltipFormat={({ y2 }) => `Total: ${formatNumber(y2)}`}
              height={height}
              curve={curve}
            />
          </>
        ) : (
          <ContentLoader
            uniqueKey={`charts.network-counts.${dataKey}`}
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

export default DataOverTimeChart;
