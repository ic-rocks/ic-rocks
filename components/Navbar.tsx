import ActiveLink from "./ActiveLink";
import DarkModeToggle from "./DarkModeToggle";
import SearchBar from "./Searchbar";

export default function Nav() {
  return (
    <nav className="flex justify-center py-4">
      <div className="flex sm:flex-row flex-col items-stretch justify-between sm:max-w-screen-lg w-full px-4">
        <ul className="flex items-center">
          <li className="pr-8">
            <a href="/">
              <img
                src="/img/icrocks-light.svg"
                alt="ic.rocks"
                className="h-8 dark:hidden"
              />
              <img
                src="/img/icrocks-dark.svg"
                alt="ic.rocks"
                className="h-8 hidden dark:block"
              />
            </a>
          </li>
          <li className="pr-4">
            <ActiveLink href="/network">Network</ActiveLink>
          </li>
          <li className="pr-4">
            <ActiveLink href="/icp">ICP</ActiveLink>
          </li>
          <li className="pr-4">
            <ActiveLink href="/interfaces">Interfaces</ActiveLink>
          </li>
          <li className="pr-4">
            <ActiveLink href="/canisters">Canisters</ActiveLink>
          </li>
        </ul>

        <div className="flex">
          <SearchBar />
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
