import { Principal } from "@dfinity/principal";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import fetchJSON from "../lib/fetch";
import useInterval from "../lib/hooks/useInterval";
import {
  NetworkResponse,
  NomicsTickerResponse,
  SparklineResponse,
} from "../lib/types/API";

type State = {
  markets: { ticker: NomicsTickerResponse; sparkline: SparklineResponse };
  network: NetworkResponse;
};

const INITIAL_STATE = {
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

  const fetchTicker = useCallback(
    () =>
      fetchJSON("/api/markets").then((res) => {
        if (res) {
          dispatch({ type: "markets", payload: res });
        }
      }),
    []
  );
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
