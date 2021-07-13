import useDarkModeDefault, { DarkMode } from "use-dark-mode";

export const useDarkMode = () => {
  if (typeof document === "undefined") {
    return { value: null } as DarkMode;
  }

  return useDarkModeDefault(undefined, {
    classNameDark: "dark",
    classNameLight: "light",
    element: document.documentElement,
  });
};
