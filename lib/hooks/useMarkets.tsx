import { useQuery } from "react-query";
import { ONE_MINUTES_MS } from "../durations";
import fetchJSON from "../fetch";
import { NomicsTickerResponse, SparklineResponse } from "../types/API";

export default function useMarkets() {
  return useQuery<{
    ticker: NomicsTickerResponse;
    sparkline: SparklineResponse;
  }>("markets", () => fetchJSON("/api/markets"), {
    staleTime: Infinity,
    refetchInterval: ONE_MINUTES_MS,
  });
}
