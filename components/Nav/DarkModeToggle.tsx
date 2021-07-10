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

export default function DarkModeToggle({ className }: { className: string }) {
  const darkMode = useDarkMode();

  const onClick = (e) => {
    darkMode.toggle();
    e.stopPropagation();
  };

  return (
    <button className={className} onClick={onClick}>
      <span className="inline-block w-4 mr-2">
        {darkMode.value ? "☀" : "☾"}
      </span>
      {darkMode.value ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
