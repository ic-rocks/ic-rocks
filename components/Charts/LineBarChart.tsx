import * as d3 from "d3";
import { DateTime } from "luxon";
import React, { useEffect, useRef } from "react";
import useMeasure from "react-use-measure";
import { useDarkMode } from "../../lib/hooks/useDarkMode";
import { formatNumber, formatNumberShortScale } from "../../lib/numbers";

const bisect = d3.bisector((d: { x: Date }) => d.x).center;

type Data = {
  x: Date;
  y1: number;
  y2: number;
};

const LineBarChart = ({
  data,
  height = 150,
  useTooltip = true,
  xTooltipFormat = (x) =>
    DateTime.fromJSDate(x).toLocaleString(DateTime.DATETIME_SHORT),
  y1TooltipFormat = ({ y1 }) => formatNumber(y1),
  y2TooltipFormat = ({ y2 }) => formatNumber(y2),
  curve = d3.curveLinear,
}: {
  data: Data[];
  height?: number;
  useTooltip?: boolean;
  xTooltipFormat?: (d: Date) => string;
  y1TooltipFormat?: (d: Data) => string;
  y2TooltipFormat?: (d: Data) => string;
  curve?: d3.CurveFactory | d3.CurveFactoryLineOnly;
}) => {
  const { value: isDark } = useDarkMode();
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [ref, { width }] = useMeasure();

  useEffect(() => {
    if (!width || !data) return;

    const parent = d3
      .select(svgRef.current)
      .attr("viewBox", `0, 0, ${width}, ${height}`);

    parent.selectAll("*").remove();

    const margin = { top: 10, right: 40, bottom: 20, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = parent
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const tooltip = d3.select(tooltipRef.current);

    let series = d3.sort(data, ({ x }) => x);

    const paddedExtent = [
      d3.min(series.map((d) => d3.utcDay.offset(d.x, -1))),
      d3.max(series.map((d) => d3.utcDay.offset(d.x, 1))),
    ];

    const xTimeScale = d3
      .scaleUtc()
      .domain(paddedExtent)
      .range([0, innerWidth]);

    const xBand = d3
      .scaleBand()
      .domain(d3.utcDay.range(...(xTimeScale.domain() as [Date, Date])) as any)
      .range([0, innerWidth])
      .padding(0.1);

    const xBandStep = xBand.step();

    const y1Scale = d3
      .scaleLinear()
      .domain([0, d3.max(series, ({ y1 }) => y1)])
      .range([innerHeight, 0]);

    const y2Scale = d3
      .scaleLinear()
      .domain([0, d3.max(series, ({ y2 }) => y2)])
      .range([innerHeight, 0]);

    const line = d3
      .line()
      .x((d: any) => xTimeScale(d.x))
      .y((d: any) => y2Scale(d.y2))
      .curve(curve);

    svg
      .append("path")
      .datum(series)
      .style("fill", "none")
      .attr("class", "line stroke-current stroke-2 text-blue-400")
      .attr("d", line as any);

    const bar = svg.append("g");

    bar
      .selectAll("rect")
      .data(series)
      .enter()
      .append("rect")
      .attr("class", "fill-current text-blue-400 opacity-50")
      .attr("x", (d) => xTimeScale(d.x) - xBand.bandwidth() / 2)
      .attr("y", (d) => y1Scale(d.y1))
      .attr("width", xBand.bandwidth())
      .attr("height", (d) => innerHeight - y1Scale(d.y1));

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + innerHeight + ")")
      .call(d3.axisBottom(xTimeScale).ticks(width / 80));

    svg
      .append("g")
      .attr("class", "y axis")
      .call(
        d3
          .axisLeft(y1Scale)
          .ticks(height / 50)
          .tickFormat(formatNumberShortScale)
      );

    svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(
        d3
          .axisRight(y2Scale)
          .ticks(height / 50)
          .tickFormat(formatNumberShortScale)
      );

    if (useTooltip) {
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
          const xDate = xTimeScale.invert(mouse[0]);
          const d = series[bisect(series, xDate)];
          const i = Math.floor(mouse[0] / xBandStep);
          const xBarDate = xBand.domain()[i] as unknown as Date;
          const isBar = DateTime.fromJSDate(xBarDate).equals(
            DateTime.fromJSDate(d.x)
          );
          let y1Label: string;
          if (isBar) {
            y1Label = y1TooltipFormat(d);
          } else {
            y1Label = y1TooltipFormat({ y1: 0, x: xBarDate, y2: d.y2 });
          }

          tooltip.select(".label-y1").text(y1Label);
          tooltip.select(".label-y2").text(y2TooltipFormat(d));
          tooltip.select(".label-x").text(xTooltipFormat(xBarDate));
          tooltip.attr(
            "style",
            `transform: translate(${mouse[0]}px,${y2Scale(d.y2)}px)`
          );

          mouseG
            .select(".mouse-line")
            .attr("transform", `translate(${mouse[0]},0)`)
            .attr("y1", y2Scale(d.y2));

          mouseG
            .select("circle")
            .attr("transform", `translate(${mouse[0]},${y2Scale(d.y2)})`);
        });
    }
  }, [data, width]);

  return data.length > 0 ? (
    <div ref={ref} className="relative">
      {useTooltip && (
        <div
          className="p-1 bg-black absolute rounded-md pointer-events-none origin-bottom"
          style={{ opacity: 0 }}
          ref={tooltipRef}
        >
          <div className="flex flex-col">
            <label className="label-y2 text-xs text-white"></label>
            <label className="label-y1 text-xs text-white"></label>
            <span className="label-x text-xxs text-gray-500"></span>
          </div>
        </div>
      )}
      <div
        style={{
          background: `no-repeat center/30% url(/img/icrocks-${
            isDark ? "dark" : "light"
          }.svg)`,
        }}
        className="absolute w-full h-full opacity-10 pointer-events-none"
      />
      <svg width={width} height={height} ref={svgRef} />
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
      No data
    </div>
  );
};

export default LineBarChart;
