import * as d3 from "d3";
import { DateTime } from "luxon";
import React, { useEffect, useRef } from "react";
import useMeasure from "react-use-measure";
import { formatNumber, formatNumberShortScale } from "../../lib/numbers";
import WaterMark from "./WaterMark";

const bisect = d3.bisector((d: { x: Date }) => d.x).center;

type Data = {
  x: Date;
  y: number;
};

const MultiLineChart = ({
  data,
  height = 150,
  useTooltip = true,
  xTooltipFormat = (x) =>
    DateTime.fromJSDate(x).toLocaleString(DateTime.DATETIME_SHORT),
  yTooltipFormat = (i, { y }) => formatNumber(y),
  curve = d3.curveLinear,
  colors = d3.schemeCategory10,
}: {
  data: Data[][];
  height?: number;
  useTooltip?: boolean;
  xTooltipFormat?: (d: Date) => string;
  yTooltipFormat?: (i: Number, d: Data) => string;
  curve?: d3.CurveFactory | d3.CurveFactoryLineOnly;
  colors?: readonly string[];
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

    const margin = { top: 10, right: 40, bottom: 20, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = parent
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const tooltip = d3.select(tooltipRef.current);

    const series = data.map((d) => d3.sort(d, ({ x }) => x));
    console.log({ series });

    const paddedExtent = [
      d3.min(series.map((d) => d[0].x)),
      d3.max(series.map((d) => d.slice(-1)[0].x)),
    ];

    const xScale = d3.scaleUtc().domain(paddedExtent).range([0, innerWidth]);

    const yScales = series.map((d) =>
      d3
        .scaleLinear()
        .domain([0, d3.max(d, ({ y }) => y)])
        .range([innerHeight, 0])
    );

    const lines = series.map((ds, i) =>
      d3
        .line()
        .x((d: any) => xScale(d.x))
        .y((d: any) => yScales[i](d.y))
        .curve(curve)
    );

    series.forEach((ds, i) =>
      svg
        .append("path")
        .datum(ds)
        .style("fill", "none")
        .attr("class", `line stroke-2`)
        .style("stroke", colors[i])
        .attr("d", lines[i] as any)
    );

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
          .axisLeft(yScales[0])
          .ticks(height / 50)
          .tickFormat(formatNumberShortScale)
      );

    svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(
        d3
          .axisRight(yScales[1])
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

      series.forEach((_, i) =>
        mouseG
          .append("circle")
          .attr("r", 4)
          .attr("class", `circle-${i} stroke-none`)
          .style("fill", colors[i])
      );

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
          const [x, y] = d3.pointer(e);

          const xDate = xScale.invert(x);
          series.forEach((ds, i) => {
            const d = ds[bisect(ds, xDate)];

            tooltip.select(`.label-y${i}`).text(yTooltipFormat(i, d));

            mouseG
              .select(`.circle-${i}`)
              .attr("transform", `translate(${x},${yScales[i](d.y)})`);
          });
          tooltip.select(".label-x").text(xTooltipFormat(xDate));
          tooltip.attr(
            "style",
            `transform: translate(${x + margin.left + 5}px,${0}px)`
          );

          mouseG.select(".mouse-line").attr("transform", `translate(${x},0)`);
        });
    }
  }, [data, width]);

  return data.length > 0 ? (
    <div ref={ref} className="relative">
      {useTooltip && (
        <div
          className="p-1 bg-black absolute rounded-md pointer-events-none"
          style={{ opacity: 0 }}
          ref={tooltipRef}
        >
          <div className="flex flex-col">
            {data.map((_, i) => (
              <div key={i} className="inline-flex items-center gap-1">
                <div className="w-2 h-2" style={{ background: colors[i] }} />
                <label className={`label-y${i} text-xs text-white`} />
              </div>
            ))}
            <span className="label-x text-xxs text-gray-500"></span>
          </div>
        </div>
      )}
      <WaterMark />
      <svg width={width} height={height} ref={svgRef} />
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
      No data
    </div>
  );
};

export default MultiLineChart;
