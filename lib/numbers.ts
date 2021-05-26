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
