import { useQuery } from "react-query";
import fetchJSON from "../fetch";

type TransactionCount = {
  day: string;
  count: number;
  sum: string;
};

export default function useTransactionCounts() {
  return useQuery<TransactionCount[]>(
    "transactions/counts",
    () => fetchJSON("/api/transactions/counts"),
    {
      staleTime: Infinity,
    }
  );
}
