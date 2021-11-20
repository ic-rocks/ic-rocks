import useDarkModeDefault, { DarkMode } from "use-dark-mode";

export const useDarkMode = () => {
  if (typeof document === "undefined") {
    return { value: null } as DarkMode;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useDarkModeDefault(undefined, {
    classNameDark: "dark",
    classNameLight: "light",
    element: document.documentElement,
  });
};
