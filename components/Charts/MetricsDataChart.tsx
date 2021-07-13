import { Menu } from "@headlessui/react";
import React, { useMemo } from "react";
import ContentLoader from "react-content-loader";
import { CgSpinner } from "react-icons/cg";
import { FiChevronDown } from "react-icons/fi";
import useMetrics, { Period } from "../../lib/hooks/useMetrics";
import { shortPrincipal } from "../../lib/strings";
import IdentifierLink from "../Labels/IdentifierLink";
import LineChart from "./LineChart";

const PERIODS = [
  { label: "Raw Data", value: null },
  { label: "By Minute", value: "Minute" },
  { label: "By Hour", value: "Hour" },
  { label: "By Day", value: "Day" },
  { label: "By Week", value: "Week" },
];

const MetricsDataChart = ({
  attributeId,
}: {
  attributeId: number | string;
}) => {
  const { data, isFetching, period, setPeriod } = useMetrics({ attributeId });

  const series = useMemo(
    () =>
      data?.series.map((x, i) => ({
        x: new Date(Number(x.timestamp / BigInt(1e6))),
        y: Number(x.value),
      })),
    [data]
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-850 p-4 shadow-md rounded-md">
      <div className="flex flex-col" style={{ minHeight: 220 }}>
        {data ? (
          <>
            <div className="flex justify-between">
              <strong>{data.description.name}</strong>
              {data.principal && (
                <IdentifierLink
                  type="principal"
                  id={data.principal.toText()}
                  name={shortPrincipal(data.principal)}
                />
              )}
            </div>
            <p className="dark:text-gray-400 text-xs pb-2">
              {data.description.description[0]}
            </p>
            <Menu
              as="div"
              className="dark:text-gray-400 flex justify-end relative text-xs"
            >
              <div className="inline-flex items-center">
                {isFetching && (
                  <CgSpinner className="inline-block animate-spin" />
                )}
                <Menu.Button className="w-18 inline-flex justify-between items-center px-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                  {PERIODS.find((p) => p.value === period)?.label || "Period"}
                  <FiChevronDown className="ml-1" />
                </Menu.Button>
              </div>
              <Menu.Items className="absolute z-10 right-2 w-18 mt-5 origin-top-right shadow-lg">
                {PERIODS.map(({ label, value }) => (
                  <Menu.Item key={value}>
                    <button
                      className="flex items-center w-full px-2 py-1 btn-default"
                      onClick={() => setPeriod(value as Period)}
                    >
                      {label}
                    </button>
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
            <LineChart data={series} />
          </>
        ) : (
          <ContentLoader
            uniqueKey={`metrics.${attributeId}`}
            className="w-full"
            width={100}
            height={220}
            viewBox="0 0 100 220"
            preserveAspectRatio="none"
          >
            <rect x="0" y="4" rx="2" ry="2" width="50%" height="16" />
            <rect x="75%" y="4" rx="2" ry="2" width="25%" height="16" />
            <rect x="0" y="26" rx="2" ry="2" width="80%" height="12" />
            <rect x="0" y="70" rx="2" ry="2" width="100%" height="150" />
          </ContentLoader>
        )}
      </div>
    </div>
  );
};

export default MetricsDataChart;
