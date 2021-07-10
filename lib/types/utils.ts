export type KeysOfUnion<T> = T extends T ? keyof T : never;
