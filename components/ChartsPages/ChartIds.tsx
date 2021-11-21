import { CurveFactory, curveMonotoneX, curveStepAfter } from "d3";
import React from "react";
import { UseQueryResult } from "react-query";
import useCanisterCounts from "../../lib/hooks/useCanisterCounts";
import useMintedCycles from "../../lib/hooks/useMintedCycles";
import useNetworkCounts from "../../lib/hooks/useNetworkCounts";
import useSubnets from "../../lib/hooks/useSubnets";
import useTransactionCounts from "../../lib/hooks/useTransactionCounts";

export type ChartId =
  | "subnets"
  | "nodes"
  | "operators"
  | "providers"
  | "canisters"
  | "transactions"
  | "icp-burned"
  | "icp-minted"
  | "cycles-minted"
  | "canisters-per-subnet";

export type ChartType = {
  id: ChartId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hook?: () => UseQueryResult<any, unknown>;
  heading?: string;
  dataKey?: string;
  curve?: CurveFactory;
  description?: JSX.Element;
};

export const ChartTypes: ChartType[] = [
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
    description: (
      <div>
        <p>New canisters created by day.</p>
        <p className="text-xs text-gray-500">
          Note: Canisters created before June 6, 2021 are missing exact creation
          dates.
        </p>
      </div>
    ),
  },
  {
    id: "transactions",
    heading: "ICP Transactions over Time",
  },
  {
    id: "icp-burned",
    hook: useTransactionCounts,
    heading: "ICP Burned over Time",
    dataKey: "burned",
    curve: curveMonotoneX,
  },
  {
    id: "icp-minted",
    hook: useTransactionCounts,
    heading: "ICP Minted over Time",
    dataKey: "minted",
    curve: curveMonotoneX,
  },
  {
    id: "cycles-minted",
    hook: useMintedCycles,
    heading: "Cycles Minted over Time",
    dataKey: "minted",
    curve: curveMonotoneX,
  },
  {
    id: "canisters-per-subnet",
    hook: useSubnets,
    heading: "Canisters per subnet",
    dataKey: "value",
  },
];
