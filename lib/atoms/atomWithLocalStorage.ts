import { atom } from "jotai";

export const atomWithLocalStorage = (key, initialValue) => {
  const getInitialValue = () => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    const item = localStorage.getItem(key);
    if (item !== null) {
      try {
        return JSON.parse(item);
      } catch (error) {
        console.warn("failed to load storage", key);
      }
    }
    return initialValue;
  };
  const baseAtom = atom(getInitialValue());
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === "function" ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      localStorage.setItem(key, JSON.stringify(nextValue));
    }
  );
  return derivedAtom;
};
