import { Menu } from "@headlessui/react";
import * as d3 from "d3";
import { DateTime } from "luxon";
import React, { useEffect, useRef } from "react";
import ContentLoader from "react-content-loader";
import { CgSpinner } from "react-icons/cg";
import { FiChevronDown } from "react-icons/fi";
import useMeasure from "react-use-measure";
import useMetrics, { Period } from "../../lib/hooks/useMetrics";
import { formatNumber, formatNumberShortScale } from "../../lib/numbers";
import { shortPrincipal } from "../../lib/strings";
import IdentifierLink from "../Labels/IdentifierLink";

const PERIODS = [
  { label: "Raw Data", value: null },
  { label: "By Minute", value: "Minute" },
  { label: "By Hour", value: "Hour" },
  { label: "By Day", value: "Day" },
  { label: "By Week", value: "Week" },
];

const bisect = d3.bisector((d: { x: Date }) => d.x).center;

const MetricsDataChart = ({
  attributeId,
}: {
  attributeId: number | string;
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [ref, { width }] = useMeasure();
  const { data, isFetching, period, setPeriod } = useMetrics({ attributeId });

  const height = 150;

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

    const tooltip = d3.select(tooltipRef.current);

    let series = d3.sort(
      data.series.map((x, i) => ({
        x: new Date(Number(x.timestamp / BigInt(1e6))),
        y: Number(x.value),
      })),
      ({ x }) => x
    );
    if (series.length === 1) {
      series = series.concat({
        x: new Date(),
        y: series[0].y,
      });
    }

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
          .tickFormat(formatNumberShortScale)
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

    const mouseG = svg
      .append("g")
      .attr("class", "mouse-over-effects")
      .style("opacity", 0);

    mouseG
      .append("line")
      .attr(
        "class",
        "mouse-line stroke-current stroke-1 text-black dark:text-white"
      )
      .attr("y1", 0)
      .attr("y2", innerHeight);

    mouseG
      .append("circle")
      .attr("r", 4)
      .attr("class", "fill-current stroke-none text-blue-400");

    mouseG
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseout", () => {
        mouseG.style("opacity", 0);
        tooltip.style("opacity", 0);
      })
      .on("mouseover", () => {
        mouseG.style("opacity", 1);
        tooltip.style("opacity", 0.5);
      })
      .on("mousemove", (e) => {
        const mouse = d3.pointer(e);
        const xDate = xScale.invert(mouse[0]);
        const i = bisect(series, xDate);
        const d = series[i];

        tooltip.select(".label-y").text(formatNumber(d.y));
        tooltip
          .select(".label-x")
          .text(
            DateTime.fromJSDate(xDate).toLocaleString(DateTime.DATETIME_SHORT)
          );
        tooltip.attr(
          "style",
          `transform: translate(${mouse[0]}px,${yScale(d.y)}px)`
        );

        mouseG
          .select(".mouse-line")
          .attr("transform", `translate(${mouse[0]},0)`)
          .attr("y1", yScale(d.y));

        mouseG
          .select("circle")
          .attr("transform", `translate(${mouse[0]},${yScale(d.y)})`);
      });
  }, [data, width]);

  return (
    <div className="bg-gray-100 dark:bg-gray-850 p-4 shadow-md rounded-md">
      <div className="flex flex-col" ref={ref} style={{ minHeight: 220 }}>
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
            {data.series.length > 0 ? (
              <div className="relative">
                <div
                  className="p-1 bg-black absolute rounded-md pointer-events-none origin-bottom"
                  style={{ opacity: 0 }}
                  ref={tooltipRef}
                >
                  <div className="flex flex-col">
                    <label className="label-y text-xs text-white"></label>
                    <span className="label-x text-xxs text-gray-500"></span>
                  </div>
                </div>
                <svg width={width} height={height} ref={svgRef} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
                No data
              </div>
            )}
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
