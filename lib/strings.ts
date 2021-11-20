import { Principal } from "@dfinity/principal";
import { getCrc32 } from "@dfinity/principal/lib/cjs/utils/getCrc";

export const pluralize = (str: string, n: number) =>
  n === 1 ? str : str + "s";

export function isUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const NUMBER_REGEX = /^\d+$/;
export const isNumber = (string: string) => NUMBER_REGEX.test(string);

const BASE64_REGEX =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
export const isBase64 = (string: string) => BASE64_REGEX.test(string);

const HEX_REGEX = /^(?:0x)?([0-9a-fA-F]*)$/;
export const isHex = (string: string) => HEX_REGEX.test(string);

const ACCOUNT_AND_TRANSACTION_REGEX = /^[0-9a-fA-F]{64}$/;
/** Returns `true` if input is a 32-byte hex string */
export const isAccountOrTransaction = (string: string) =>
  ACCOUNT_AND_TRANSACTION_REGEX.test(string);

export const isAccount = (string: string) => {
  try {
    const blob = Buffer.from(string, "hex");
    const crc32Buf = Buffer.alloc(4);
    crc32Buf.writeUInt32BE(getCrc32(blob.slice(4)));
    return blob.slice(0, 4).toString() === crc32Buf.toString();
  } catch (error) {
    return false;
  }
};

export enum IdentityKind {
  None,
  Principal,
  AccountIdentifier,
  Transaction,
  NeuronId,
  Candid,
  Wasm,
}
export const getIdentityKind = (
  blob: string
): [IdentityKind, Principal | string] => {
  let input = blob.trim();
  if (input) {
    if (input.includes("-")) {
      try {
        const principal = Principal.fromText(input);
        return [IdentityKind.Principal, principal];
        // eslint-disable-next-line no-empty
      } catch {}
    }
    if (isHex(input) && input.startsWith("0x")) {
      input = input.slice(2);
    }

    if (isAccountOrTransaction(input)) {
      return [
        isAccount(input)
          ? IdentityKind.AccountIdentifier
          : IdentityKind.Transaction,
        input,
      ];
    } else if (input.match(/^[0-9a-fA-F]+$/)) {
      if (input.match(/^4449444C/i)) {
        return [IdentityKind.Candid, input];
      }
      if (input.match(/^0061736d/i)) {
        return [IdentityKind.Wasm, input];
      }
      if (input.length <= 58) {
        const principal = Principal.fromHex(input);
        return [IdentityKind.Principal, principal];
      }
    } else if (input.match(/^\d+$/)) {
      return [IdentityKind.NeuronId, input];
    }
    if (isBase64(input)) {
      const b64Buf = Buffer.from(input, "base64");
      const b64 = b64Buf.toString("base64");
      if (b64 === input) {
        const [kind, obj] = getIdentityKind(b64Buf.toString("hex"));
        if (kind !== IdentityKind.None) {
          return [kind, obj];
        } else {
          return [kind, input];
        }
      }
    }
  }
  return [IdentityKind.None, input];
};

export const guessEncoding = (string: string): [Buffer, BufferEncoding] => {
  if (isBase64(string)) {
    return [Buffer.from(string, "base64"), "base64"];
  }
  const hexMatch = string.match(HEX_REGEX);
  if (hexMatch) {
    return [Buffer.from(hexMatch[1], "hex"), "hex"];
  }
  return [Buffer.from(string, "utf-8"), "utf-8"];
};

export const shortPrincipal = (principal: string | Principal) => {
  const parts = (
    typeof principal === "string" ? principal : principal.toText()
  ).split("-");
  return `${parts[0]}...${parts.slice(-1)[0]}`;
};

export const capitalize = (string: string) =>
  string[0].toUpperCase() + string.slice(1);

export type SignDisplay = "auto" | "never" | "always" | "exceptZero";
export const formatPercent = (
  number: number,
  signDisplay: SignDisplay = "auto",
  digits = 2
) => {
  return Intl.NumberFormat("en-US", {
    style: "percent",
    signDisplay,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(number);
};
