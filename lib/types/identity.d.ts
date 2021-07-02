/// <reference path="node_modules/@dfinity/agent/lib/cjs/auth.d.ts" />
import { Identity } from "@dfinity/agent";

declare module "@dfinity/agent" {
  export interface CustomIdentity extends Identity {
    _inner?: any;
    sign?: SignIdentity.sign;
  }
}
