import React from "react";
import { formatNumber } from "../../lib/numbers";

export default function BalanceLabel({
  value,
  digits,
}: {
  value: number | string | bigint;
  digits?: number;
}) {
  return (
    <>
      {formatNumber(Number(value) / 1e8, digits)}{" "}
      <span className="text-xs">ICP</span>
    </>
  );
}
