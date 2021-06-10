import React from "react";
import { formatNumber } from "../lib/numbers";

export default function BalanceLabel({
  value,
}: {
  value: number | string | bigint;
}) {
  return (
    <>
      {formatNumber(Number(value) / 1e8)} <span className="text-xs">ICP</span>
    </>
  );
}
