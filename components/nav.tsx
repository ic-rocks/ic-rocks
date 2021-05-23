import ActiveLink from "./ActiveLink";
import DarkModeToggle from "./DarkModeToggle";

export default function Nav() {
  return (
    <nav
      className={
        "w-full flex justify-center z-10 transition-all duration-200 py-4"
      }
    >
      <ul className="flex items-center sm:max-w-screen-lg w-full">
        <li className="pr-4">
          <ActiveLink href="/">home</ActiveLink>
        </li>
        <li className="pr-4">
          <ActiveLink href="/icp">icp</ActiveLink>
        </li>
        <li className="pr-4">
          <ActiveLink href="/interface" exact={false}>
            interfaces
          </ActiveLink>
        </li>
      </ul>

      <DarkModeToggle />
    </nav>
  );
}
