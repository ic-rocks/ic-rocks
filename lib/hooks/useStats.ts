import { useQuery } from "react-query";
import { ONE_MINUTES_MS } from "../durations";
import fetchJSON from "../fetch";
import { StatsResponse } from "../types/API";

export default function useStats() {
  return useQuery<StatsResponse>("stats", () => fetchJSON("/api/stats"), {
    staleTime: Infinity,
    refetchInterval: ONE_MINUTES_MS,
  });
}
