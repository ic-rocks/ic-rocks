import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import extendProtobuf from "agent-pb";
import protobuf from "protobufjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import protobufJson from "../lib/canisters/proto.json";
import fetchJSON from "../lib/fetch";
import useInterval from "../lib/hooks/useInterval";
import {
  NetworkResponse,
  NomicsTickerResponse,
  SparklineResponse,
  StatsResponse,
} from "../lib/types/API";
import { UInt64Value } from "../lib/types/canisters";

const root = protobuf.Root.fromJSON(protobufJson as protobuf.INamespace);
const agent = new HttpAgent({ host: "https://ic0.app" });
const cyclesMinting = Actor.createActor(() => IDL.Service({}), {
  agent,
  canisterId: "rkp4c-7iaaa-aaaaa-aaaca-cai",
});
extendProtobuf(cyclesMinting, root.lookupService("CyclesMinting"));

type State = {
  stats: StatsResponse;
  tCycles: bigint;
  markets: { ticker: NomicsTickerResponse; sparkline: SparklineResponse };
  network: NetworkResponse;
};

const INITIAL_STATE = {
  stats: null,
  tCycles: null,
  markets: null,
  network: null,
  fetchNetwork: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "fetchNetwork":
      return { ...state, fetchNetwork: true };
    default:
      return { ...state, [action.type]: action.payload };
  }
};

const StateContext = createContext<State>(null);
const DispatchContext = createContext(null);

export const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const fetchTicker = useCallback(async () => {
    fetchJSON("/api/markets").then((res) => {
      if (res) {
        dispatch({ type: "markets", payload: res });
      }
    });

    fetchJSON("/api/stats").then(
      (res) => res && dispatch({ type: "stats", payload: res })
    );

    const tCycles =
      BigInt(
        ((await cyclesMinting.total_cycles_minted({})) as UInt64Value).value
      ) / BigInt(1e12);
    dispatch({ type: "tCycles", payload: tCycles });
  }, []);
  useInterval(fetchTicker, 60 * 1000);

  useEffect(() => {
    fetchTicker();
  }, []);

  useEffect(() => {
    if (state.fetchNetwork) return;

    fetchJSON("/api/network").then((data) => {
      if (!data) return;

      const payload = {
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
      dispatch({ type: "network", payload });
    });
  }, [state.fetchNetwork]);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
};

export const useGlobalState = () => useContext(StateContext);
export const useGlobalDispatch = () => useContext(DispatchContext);
