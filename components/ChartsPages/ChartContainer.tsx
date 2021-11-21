import Link from "next/link";
import React from "react";
import ContentLoader from "react-content-loader";
import { FiChevronRight } from "react-icons/fi";
import { ChartId } from "./ChartIds";

type Props = {
  chartId: ChartId;
  isFull?: boolean;
  heading: string;
  dataKey: string;
  isLoading: boolean;
  children: React.ReactNode;
};

export const ChartContainer = ({
  chartId,
  isFull = false,
  heading,
  dataKey,
  isLoading,
  children,
}: Props) => {
  const height = isFull ? 400 : 250;
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-850 rounded-md shadow-md">
      <div className="flex flex-col" style={{ minHeight: height }}>
        {!isLoading ? (
          <>
            {!isFull && (
              <Link href={`/charts/${chartId}`}>
                <a className="inline-flex items-center font-bold link-overflow">
                  {heading} <FiChevronRight />
                </a>
              </Link>
            )}
            {children}
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
