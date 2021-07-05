import { Principal } from "@dfinity/principal";
import { useQuery } from "react-query";
import fetchJSON from "../fetch";
import { NetworkResponse } from "../types/API";

export default function useNetwork() {
  return useQuery<NetworkResponse>(
    "network",
    () =>
      fetchJSON("/api/network").then((data) => {
        if (!data) return;

        return {
          subnets: data.subnets.map((s) => [
            Principal.fromUint8Array(
              Uint8Array.from(Buffer.from(s[0], "base64"))
            ).toText(),
            s[1],
          ]),
          nodes: data.nodes.map(([id, ...rest]) => [
            Principal.fromUint8Array(
              Uint8Array.from(Buffer.from(id, "base64"))
            ).toText(),
            ...rest,
          ]),
          principals: data.principals.map((s) => [
            Principal.fromUint8Array(
              Uint8Array.from(Buffer.from(s[0], "base64"))
            ).toText(),
            s[1],
          ]),
        };
      }),
    {
      staleTime: Infinity,
    }
  );
}
