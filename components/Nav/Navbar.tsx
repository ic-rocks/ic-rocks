import Link from "next/link";
import React from "react";
import ActiveLink from "../ActiveLink";
import Dropdown from "./Dropdown";
import SearchBar from "./Searchbar";

export default function Nav() {
  return (
    <nav className="pt-4 flex flex-col gap-4">
      <div className="flex flex-col xs:flex-row items-stretch xs:justify-between gap-2">
        <div className="flex-none xs:pr-8">
          <Link href="/">
            <img
              src="/img/icrocks-light.svg"
              alt="ic.rocks"
              className="h-8 dark:hidden cursor-pointer"
            />
          </Link>
          <Link href="/">
            <img
              src="/img/icrocks-dark.svg"
              alt="ic.rocks"
              className="h-8 hidden dark:block cursor-pointer"
            />
          </Link>
        </div>

        <div className="flex-1 flex flex-col xs:flex-row items-stretch xs:items-start max-w-sm gap-4">
          <SearchBar />
          <Dropdown />
        </div>
      </div>

      <ul className="flex flex-1 xs:py-2 divide-y divide-default xs:divide-none flex-col xs:flex-wrap xs:flex-row xs:items-center border-b xs:border-t border-gray-200 dark:border-gray-800 xs:gap-4">
        <li>
          <ActiveLink href="/network">Network</ActiveLink>
        </li>
        <li>
          <ActiveLink href="/canisters">Canisters</ActiveLink>
        </li>
        <li>
          <ActiveLink href="/proposals">Proposals</ActiveLink>
        </li>
        <li>
          <ActiveLink href="/neurons">Neurons</ActiveLink>
        </li>
        <li>
          <ActiveLink href="/principals">Principals</ActiveLink>
        </li>
        <li>
          <ActiveLink href="/accounts">Accounts</ActiveLink>
        </li>
        <li>
          <ActiveLink href="/transactions">Transactions</ActiveLink>
        </li>
        <li>
          <ActiveLink href="/tools/blob">Tools</ActiveLink>
        </li>
      </ul>
    </nav>
  );
}
