import ActiveLink from "./ActiveLink";
import DarkModeToggle from "./DarkModeToggle";

export default function Nav() {
  return (
    <nav className="flex justify-center py-4">
      <div className="flex justify-between sm:max-w-screen-lg sm:w-full px-4">
        <ul className="flex items-center">
          <li className="pr-4">
            <ActiveLink href="/">home</ActiveLink>
          </li>
          <li className="pr-4">
            <ActiveLink href="/icp">icp</ActiveLink>
          </li>
          <li className="pr-4">
            <ActiveLink href="/interfaces" exact={false}>
              interfaces
            </ActiveLink>
          </li>
        </ul>

        <DarkModeToggle />
      </div>
    </nav>
  );
}
