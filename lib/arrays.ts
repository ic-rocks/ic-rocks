export function countBy<T>(xs: T[], key: string): number {
  return xs.reduce((s: Set<any>, x) => s.add(x[key]), new Set()).size;
}

export function groupBy<T>(xs: T[], key: string): Record<string, T[]> {
  return xs.reduce((g, x) => {
    if (!g[x[key]]) g[x[key]] = [];
    g[x[key]].push(x);
    return g;
  }, {});
}

export const groupByArray = <T>(xs: T[], key: string) =>
  Object.entries(groupBy(xs, key));
