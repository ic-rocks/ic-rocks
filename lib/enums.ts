export const entries = (enum_: unknown): [string, number][] =>
  Object.entries(enum_).filter(([, id]) => typeof id === "number");
