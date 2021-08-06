import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import extendProtobuf from "agent-pb";
import protobuf from "protobufjs";
import { useQuery } from "react-query";
import protobufJson from "../canisters/proto.json";
import { UInt64Value } from "../types/canisters";

const root = protobuf.Root.fromJSON(protobufJson as protobuf.INamespace);
const agent = new HttpAgent({ host: "https://ic0.app" });
const cyclesMinting = Actor.createActor(() => IDL.Service({}), {
  agent,
  canisterId: "rkp4c-7iaaa-aaaaa-aaaca-cai",
});
extendProtobuf(cyclesMinting, root.lookupService("CyclesMinting"));

export default function useTotalCycles() {
  return useQuery<bigint>(
    "total-cycles",
    async () =>
      BigInt(
        ((await cyclesMinting.total_cycles_minted({})) as UInt64Value).value
      ) / BigInt(1e12),
    {
      staleTime: Infinity,
    }
  );
}
