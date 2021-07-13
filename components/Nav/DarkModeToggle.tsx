import { useDarkMode } from "../../lib/hooks/useDarkMode";

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
