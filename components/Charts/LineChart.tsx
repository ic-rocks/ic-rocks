import * as d3 from "d3";
import { DateTime } from "luxon";
import React, { useEffect, useRef } from "react";
import useMeasure from "react-use-measure";
import { formatNumber, formatNumberShortScale } from "../../lib/numbers";
import WaterMark from "./WaterMark";

const bisect = d3.bisector((d: { x: Date }) => d.x).center;

type DataSeries = {
  x: Date;
  y: number;
}[];

const LineChart = ({
  data,
  height = 150,
  useTooltip = true,
}: {
  data: DataSeries;
  height?: number;
  useTooltip?: boolean;
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [ref, { width }] = useMeasure();

  useEffect(() => {
    if (!width || !data) return;

    const parent = d3
      .select(svgRef.current)
      .attr("viewBox", `0, 0, ${width}, ${height}`);

    parent.selectAll("*").remove();

    const margin = { top: 10, right: 20, bottom: 20, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const defs = parent.append("defs");

    const gradient = defs
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

    const svg = parent
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const tooltip = d3.select(tooltipRef.current);

    let series = d3.sort(data, ({ x }) => x);
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

  return data.length > 0 ? (
    <div ref={ref} className="relative">
      {useTooltip && (
        <div
          className="absolute p-1 bg-black rounded-md origin-bottom pointer-events-none"
          style={{ opacity: 0 }}
          ref={tooltipRef}
        >
          <div className="flex flex-col">
            <label className="text-xs text-white"></label>
            <span className="text-xxs text-gray-500"></span>
          </div>
        </div>
      )}
      <WaterMark />
      <svg width={width} height={height} ref={svgRef} />
    </div>
  ) : (
    <div className="flex flex-1 justify-center items-center text-xs text-gray-500">
      No data
    </div>
  );
};

export default LineChart;
