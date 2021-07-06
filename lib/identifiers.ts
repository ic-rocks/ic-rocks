import { Principal } from "@dfinity/principal";
import { getCrc32 } from "@dfinity/principal/lib/cjs/utils/getCrc";
import { PrincipalType } from "./types/PrincipalType";

export const addCrc32 = (buf: Buffer): Buffer => {
  const crc32Buf = Buffer.alloc(4);
  crc32Buf.writeUInt32BE(getCrc32(buf), 0);
  return Buffer.concat([crc32Buf, buf]);
};

export const getPrincipalType = (principalId: string): PrincipalType | null => {
  if (!principalId) return null;

  let principalRaw;
  try {
    principalRaw = Principal.fromText(principalId).toUint8Array();
  } catch (error) {
    console.warn(error);
    return null;
  }

  switch (principalRaw.slice(-1)[0]) {
    case 1:
      return "Canister";
    case 2:
      return "User";
    case 3:
      return "Derived";
    case 4:
      return "Anonymous";
  }
  return "Unknown";
};
