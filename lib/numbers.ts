import { DateTime } from "luxon";

export const formatNumberUSD = (number: number, digits: number = 2) => {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(number);
};

export const formatNumber = (number: number) => {
  return Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(number);
};

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
