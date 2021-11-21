// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="node_modules/@dfinity/agent/lib/cjs/auth.d.ts" />
import { Identity } from "@dfinity/agent";

declare module "@dfinity/agent" {
  export interface CustomIdentity extends Identity {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _inner?: any;
    sign?: SignIdentity.sign;
  }
}
