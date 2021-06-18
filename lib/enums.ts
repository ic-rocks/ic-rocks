export const entries = (enum_: Object): [string, number][] =>
  Object.entries(enum_).filter(([name, id]) => typeof id === "number");
