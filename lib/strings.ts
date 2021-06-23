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

const BASE64_REGEX =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
export const isBase64 = (string: string) => BASE64_REGEX.test(string);

const HEX_REGEX = /^(?:0x)?([0-9a-fA-F]*)$/;
export const isHex = (string: string) => HEX_REGEX.test(string);

export enum IdentityKind {
  None,
  Principal,
  AccountIdentifier,
  Transaction,
  NeuronId,
  Candid,
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
      } catch {}
    }
    if (isHex(input) && input.startsWith("0x")) {
      input = input.slice(2);
    }

    if (input.length === 64) {
      try {
        const blob = Buffer.from(input, "hex");
        const crc32Buf = Buffer.alloc(4);
        crc32Buf.writeUInt32BE(getCrc32(blob.slice(4)));
        if (blob.slice(0, 4).toString() === crc32Buf.toString()) {
          return [IdentityKind.AccountIdentifier, input];
        } else {
          return [IdentityKind.Transaction, input];
        }
      } catch (error) {}
    } else if (input.match(/^[0-9a-fA-F]+$/)) {
      if (input.match(/^4449444C/i)) {
        return [IdentityKind.Candid, input];
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
  digits: number = 2
) => {
  return Intl.NumberFormat("en-US", {
    style: "percent",
    // @ts-ignore
    signDisplay,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(number);
};
