import Link from "next/link";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  PieLabelRenderProps,
} from "recharts";
import { pluralize } from "../../lib/strings";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  isFull,
  subnetCount,
}: PieLabelRenderProps & { isFull: boolean; subnetCount: number }) => {
  const radius = +innerRadius + (+outerRadius - +innerRadius) * 0.3;
  const x = +cx + radius * Math.cos(-midAngle * RADIAN);
  const y = +cy + radius * Math.sin(-midAngle * RADIAN);

  const label =
    Math.round(percent * 100) > 1 ? `${Math.round(percent * 100)}%` : "";
  return (
    <g>
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {label}
      </text>

      {isFull ? null : (
        <g textAnchor="middle">
          <text fill="white" fontSize="30px" x={cx} y={cy} dy={8}>
            {subnetCount}
          </text>
          <text fill="#777" fontSize="20px" x={cx} y={cy} dy={30}>
            subnets
          </text>
        </g>
      )}
    </g>
  );
};

const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <Link href={`/subnet/${payload.name}`}>
        <text
          fontSize="40px"
          x={cx}
          y={cy}
          dy={8}
          textAnchor="middle"
          fill={fill}
        >
          <a className="inline-flex cursor-pointer link-overflow">
            {payload.name.slice(0, 5)}
          </a>
        </text>
      </Link>
      <text
        fontSize="20px"
        x={cx}
        y={cy}
        dy={50}
        textAnchor="middle"
        fill={fill}
      >
        {payload.subnetType}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#777"
      >
        {pluralize(`${value} canister`, value)}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {pluralize(`${payload.nodeCount} Node`, payload.nodeCount)}
      </text>
    </g>
  );
};

export type DonutSeries = {
  name: string;
  value: number;
  subnetType: string;
  nodeCount: number;
};
const DonutChart = ({
  data,
  isFull,
}: {
  isFull: boolean;
  data: DonutSeries[];
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const activeShapeProps = isFull
    ? {
        activeIndex: activeIndex,
        activeShape: renderActiveShape,
        onMouseEnter: (_, index: number) => setActiveIndex(index),
      }
    : {};

  return (
    <div style={{ width: "100%", height: isFull ? 500 : 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            {...activeShapeProps}
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(rechartData) =>
              renderCustomizedLabel({
                ...rechartData,
                isFull,
                subnetCount: data.length,
              })
            }
            innerRadius={isFull ? 140 : 70}
            outerRadius={isFull ? 190 : 120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;
