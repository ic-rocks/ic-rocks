export function countBy<T>(xs: T[], key: string): number {
  return xs.reduce((s: Set<any>, x) => s.add(x[key]), new Set()).size;
}
