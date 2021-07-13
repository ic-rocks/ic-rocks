import { curveMonotoneX, curveStepAfter } from "d3";
import useCanisterCounts from "../../lib/hooks/useCanisterCounts";
import useNetworkCounts from "../../lib/hooks/useNetworkCounts";

export const ChartIds = [
  {
    id: "subnets",
    hook: useNetworkCounts,
    heading: "Subnets over Time",
    dataKey: "subnets",
    curve: curveStepAfter,
  },
  {
    id: "nodes",
    hook: useNetworkCounts,
    heading: "Nodes over Time",
    dataKey: "nodes",
    curve: curveStepAfter,
  },
  {
    id: "operators",
    hook: useNetworkCounts,
    heading: "Node Operators over Time",
    dataKey: "operators",
    curve: curveStepAfter,
  },
  {
    id: "providers",
    hook: useNetworkCounts,
    heading: "Node Providers over Time",
    dataKey: "providers",
    curve: curveStepAfter,
  },
  {
    id: "canisters",
    hook: useCanisterCounts,
    heading: "Total Canisters over Time",
    dataKey: "createdCount",
    curve: curveMonotoneX,
  },
] as const;

export type ChartId = typeof ChartIds[number]["id"];
