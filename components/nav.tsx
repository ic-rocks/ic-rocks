import ActiveLink from "./ActiveLink";
import DarkModeToggle from "./DarkModeToggle";
import SearchBar from "./Searchbar";

export default function Nav() {
  return (
    <nav className="flex justify-center py-4">
      <div className="flex justify-between sm:max-w-screen-lg sm:w-full px-4">
        <ul className="flex items-center">
          <li className="pr-4">
            <ActiveLink href="/">Home</ActiveLink>
          </li>
          <li className="pr-4">
            <ActiveLink href="/icp">ICP</ActiveLink>
          </li>
          <li className="pr-4">
            <ActiveLink href="/interfaces">Interfaces</ActiveLink>
          </li>
          <li className="pr-4">
            <ActiveLink href="/canister">Canisters</ActiveLink>
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
