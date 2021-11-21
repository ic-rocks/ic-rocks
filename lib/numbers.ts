import { DateTime } from "luxon";

export const formatNumberShortScale = (n: number) => {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toString();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatNumberUSD = (number: any, digits = 2) => {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(number);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatNumber = (number: any, digits?) => {
  let n = number;
  if (typeof number !== "number") {
    n = Number(n);
  }
  const maximumFractionDigits =
    typeof digits === "undefined" ? (number < 1 ? 8 : 4) : digits;
  return Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(n);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const maybeTimestamp = (number: any): DateTime | null => {
  // Assume timestamps are in the range 1e9 < seconds < 2.5e9 (from 2001-09-09 to 2049-03-22)
  let n = number;
  if (typeof number !== "object") {
    n = BigInt(number);
  }
  if (typeof n === "bigint") {
    if (n > BigInt("1000000000") && n < BigInt("2500000000")) {
      return DateTime.fromSeconds(Number(n));
    } else if (n > BigInt("1000000000000") && n < BigInt("2500000000000")) {
      return DateTime.fromMillis(Number(n));
    } else if (
      n > BigInt("1000000000000000") &&
      n < BigInt("2500000000000000")
    ) {
      return DateTime.fromMillis(Number(n / BigInt("1000")));
    }
  }
  return null;
};
