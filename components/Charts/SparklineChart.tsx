import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { SparklineResponse } from "../../lib/types/API";

const SparklineChart = ({ data }: { data: SparklineResponse[number] }) => {
  const svgRef = useRef(null);

  const width = 250;
  let height = 150;

  useEffect(() => {
    if (!width) return;

    const parent = d3
      .select(svgRef.current)
      .attr("viewBox", `0, 0, ${width}, ${height}`);

    parent.selectAll("*").remove();

    const margin = { top: 10, right: 20, bottom: 20, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = parent
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const zipped = data.timestamps.map((x, i) => ({
      x: new Date(x),
      y: Number(data.prices[i]),
    }));

    const xScale = d3
      .scaleUtc()
      .domain(d3.extent(zipped, ({ x }) => x))
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(zipped, ({ y }) => y)])
      .range([innerHeight, 0]);

    const line = d3
      .line()
      .x((d: any) => xScale(d.x))
      .y((d: any) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + innerHeight + ")")
      .call(d3.axisBottom(xScale).ticks(width / 80));

    svg
      .append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale).ticks(height / 50));

    svg
      .append("path")
      .datum(zipped)
      .attr("class", "line stroke-current stroke-2 dark:text-gray-400")
      .attr("fill", "none")
      .attr("d", line as any);
  }, [width]);

  return <svg width={width} height={height} ref={svgRef} />;
};

export default SparklineChart;
