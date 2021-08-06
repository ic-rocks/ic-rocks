import { useQuery } from "react-query";
import fetchJSON from "../fetch";

export default function useNetworkCounts() {
  return useQuery("network/counts", () => fetchJSON("/api/network/counts"), {
    staleTime: Infinity,
  });
}
