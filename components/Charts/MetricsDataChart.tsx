import { Menu } from "@headlessui/react";
import classNames from "classnames";
import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import ContentLoader from "react-content-loader";
import { FiChevronDown } from "react-icons/fi";
import useMeasure from "react-use-measure";
import useMetrics, { Period } from "../../lib/hooks/useMetrics";
import { shortPrincipal } from "../../lib/strings";
import IdentifierLink from "../Labels/IdentifierLink";

const PERIODS = [
  { label: "Raw Data", value: null },
  { label: "By Minute", value: "Minute" },
  { label: "By Hour", value: "Hour" },
  { label: "By Day", value: "Day" },
  { label: "By Week", value: "Week" },
];

const formatNumber = (n: number) => {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toString();
};

const MetricsDataChart = ({
  attributeId,
}: {
  attributeId: number | string;
}) => {
  const svgRef = useRef(null);
  const [ref, { width }] = useMeasure();
  const { data, period, setPeriod } = useMetrics({ attributeId });

  let height = 150;

  useEffect(() => {
    if (!width || !data) return;

    const parent = d3
      .select(svgRef.current)
      .attr("viewBox", `0, 0, ${width}, ${height}`);

    parent.selectAll("*").remove();

    const margin = { top: 10, right: 20, bottom: 20, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    parent.append("defs");

    const createGradient = (select) => {
      const gradient = select
        .select("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "20%")
        .attr("y2", "0%");

      gradient
        .append("stop")
        .attr("offset", "40%")
        .attr("style", "stop-color:#3b82f6;stop-opacity:0");

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("style", "stop-color:#3b82f6;stop-opacity:.25");
    };

    parent.call(createGradient);

    const svg = parent
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const series = data.series.map((x, i) => ({
      x: new Date(Number(x.timestamp / BigInt(1e6))),
      y: Number(x.value),
    }));

    const xScale = d3
      .scaleUtc()
      .domain(d3.extent(series, ({ x }) => x))
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(series, ({ y }) => y)])
      .range([innerHeight, 0]);

    const line = d3
      .line()
      .x((d: any) => xScale(d.x))
      .y((d: any) => yScale(d.y));
    // .curve(d3.curveCatmullRom.alpha(0.5));

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + innerHeight + ")")
      .call(d3.axisBottom(xScale).ticks(width / 80));

    svg
      .append("g")
      .attr("class", "y axis")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(height / 50)
          .tickFormat(formatNumber)
      );

    const area = d3
      .area()
      .x((d: any) => xScale(d.x))
      .y0(innerHeight)
      .y1((d: any) => yScale(d.y));
    svg
      .append("path")
      .datum(series)
      .style("fill", "none")
      .attr("class", "line stroke-current stroke-2 text-blue-400")
      .attr("d", line as any);

    svg
      .append("path")
      .datum(series)
      .style("fill", "url(#gradient)")
      .attr("d", area as any);
  }, [data, width]);

  return (
    <div className="flex bg-gray-50 dark:bg-gray-850 p-4 shadow-md rounded-md">
      <div
        className="flex-1 flex flex-col "
        ref={ref}
        style={{ minHeight: 220 }}
      >
        {data ? (
          <>
            <div className="flex justify-between">
              <strong>{data?.description.name}</strong>
              {data?.principal && (
                <IdentifierLink
                  type="principal"
                  id={data.principal.toText()}
                  name={shortPrincipal(data.principal)}
                />
              )}
            </div>
            <p className="dark:text-gray-400 text-xs pb-2">
              {data?.description.description[0]}
            </p>
            <Menu
              as="div"
              className={classNames(
                "dark:text-gray-400 flex justify-end relative text-xs",
                { invisible: !data }
              )}
            >
              <Menu.Button className="w-18 inline-flex justify-between items-center px-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                {PERIODS.find((p) => p.value === period)?.label || "Period"}
                <FiChevronDown />
              </Menu.Button>
              <Menu.Items className="absolute right-2 w-18 mt-6 origin-top-right bg-gray-100 dark:bg-gray-800">
                {PERIODS.map(({ label, value }) => (
                  <Menu.Item>
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
            <svg width={width} height={height} ref={svgRef} />
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
