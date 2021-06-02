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
