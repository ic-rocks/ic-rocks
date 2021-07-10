import { Actor, HttpAgent } from "@dfinity/agent";
import { useEffect, useState } from "react";
import Metrics, {
  AttributeRecord,
  GetPeriod,
} from "../canisters/Metrics/Metrics";
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
  const [data, setData] = useState<AttributeRecord>();
  const [period, setPeriod] = useState<Period>(null);
  useEffect(() => {
    const metrics = Actor.createActor<Metrics>(MetricsIDL, {
      agent,
      canisterId,
    });
    (async () => {
      const record = await metrics.recordById({
        attributeId: BigInt(attributeId),
        before: [],
        limit: [],
        period: period ? [{ [period]: null } as GetPeriod] : [],
      });
      if ("ok" in record) {
        setData(record.ok);
      }
    })();
  }, [canisterId, attributeId, period]);
  return { data, period, setPeriod };
}
