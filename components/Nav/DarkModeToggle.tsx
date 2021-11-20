import React from "react";
import { useDarkMode } from "../../lib/hooks/useDarkMode";

export default function DarkModeToggle({ className }: { className: string }) {
  const darkMode = useDarkMode();

  const onClick = (e) => {
    darkMode.toggle();
    e.stopPropagation();
  };

  return (
    <button className={className} onClick={onClick}>
      <span className="inline-block mr-2 w-4">
        {darkMode.value ? "☀" : "☾"}
      </span>
      {darkMode.value ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
