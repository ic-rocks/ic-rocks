import React from "react";
import { formatNumber } from "../../lib/numbers";

export default function BalanceLabel({
  value,
  digits,
}: {
  value: number | string | bigint;
  digits?: number;
}) {
  const num = Number(value);
  if (isNaN(num)) return <>-</>;
  return (
    <>
      {formatNumber(num / 1e8, digits)} <span className="text-xs">ICP</span>
    </>
  );
}
