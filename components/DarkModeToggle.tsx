import useDarkMode from "use-dark-mode";

export default function DarkModeToggle() {
  if (typeof window === "undefined") {
    return null;
  }

  const darkMode = useDarkMode(undefined, {
    classNameDark: "dark",
    classNameLight: "light",
    element: document.documentElement,
  });

  return (
    <button
      type="button"
      onClick={darkMode.toggle}
      className="px-2 py-1 rounded focus:outline-none bg-gray-200 dark:bg-gray-800"
    >
      {darkMode.value ? "☀" : "☾"}
    </button>
  );
}
