import useDarkMode from "use-dark-mode";
import ClientOnly from "../ClientOnly";

function DarkModeToggle({ className }: { className: string }) {
  const darkMode = useDarkMode(undefined, {
    classNameDark: "dark",
    classNameLight: "light",
    element: document.documentElement,
  });

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

export default function DarkModeToggleWrapped({
  className,
}: {
  className: string;
}) {
  return (
    <ClientOnly>
      <DarkModeToggle className={className} />
    </ClientOnly>
  );
}
