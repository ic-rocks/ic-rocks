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
