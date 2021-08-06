import { useQuery } from "react-query";
import fetchJSON from "../fetch";

export default function useCanisterCounts() {
  return useQuery(
    "canisters/counts",
    () => fetchJSON("/api/canisters/counts"),
    {
      staleTime: Infinity,
    }
  );
}
