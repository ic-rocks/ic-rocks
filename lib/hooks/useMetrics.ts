import { Actor, HttpAgent } from "@dfinity/agent";
import { useState } from "react";
import { useQuery } from "react-query";
import Metrics, { GetPeriod } from "../canisters/Metrics/Metrics";
import MetricsIDL from "../canisters/Metrics/Metrics.did";
import { KeysOfUnion } from "../types/utils";

export type Period = KeysOfUnion<GetPeriod>;

const agent = new HttpAgent({ host: "https://ic0.app" });
export default function useMetrics({
  canisterId = "bsusq-diaaa-aaaah-qac5q-cai",
  attributeId,
}: {
  canisterId?: string;
  attributeId: number | string;
}) {
  const [period, setPeriod] = useState<Period>(null);
  const { data, isFetching } = useQuery(
    ["metrics", { canisterId, attributeId, period }],
    async () => {
      const metrics = Actor.createActor<Metrics>(MetricsIDL, {
        agent,
        canisterId,
      });
      const record = await metrics.recordById({
        attributeId: BigInt(attributeId),
        before: [],
        limit: [],
        period: period ? [{ [period]: null } as GetPeriod] : [],
      });
      if ("ok" in record) {
        return record.ok;
      }
      throw record.err;
    },
    {
      keepPreviousData: true,
      staleTime: period === "Minute" || !period ? 60 * 1000 : Infinity,
    }
  );
  return { data, isFetching, period, setPeriod };
}
