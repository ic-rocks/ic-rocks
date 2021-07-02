import { HttpAgent } from "@dfinity/agent";
import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

export const agentAtom = atomWithReset<HttpAgent>(
  new HttpAgent({ host: "https://ic0.app" })
);

export const authAtom = atom({
  signature: null,
  principal: null,
  publicKey: null,
});
