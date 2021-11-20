import { useAtom } from "jotai";
import Link from "next/link";
import React from "react";
import { FaBookmark } from "react-icons/fa";
import { authAtom } from "../../state/auth";
import ActiveLink from "../ActiveLink";
import Dropdown from "./Dropdown";
import SearchBar from "./Searchbar";

export default function Nav() {
  const [auth] = useAtom(authAtom);

  return (
    <nav className="flex flex-col gap-4 pt-4">
      <div className="flex flex-col xs:flex-row gap-2 xs:justify-between items-stretch">
        <div className="flex-none xs:pr-8">
          <Link href="/">
            <img
              src="/img/icrocks-light.svg"
              alt="ic.rocks"
              className="dark:hidden h-8 cursor-pointer"
            />
          </Link>
          <Link href="/">
            <img
              src="/img/icrocks-dark.svg"
              alt="ic.rocks"
              className="hidden dark:block h-8 cursor-pointer"
            />
          </Link>
        </div>

        <div className="flex flex-col xs:flex-row flex-1 gap-2 items-stretch xs:items-start max-w-md">
          <SearchBar />
          {!!auth && (
            <Link href="/bookmarks">
              <a
                className="inline-flex items-center py-1 px-1.5 h-full btn-default"
                title="Bookmarks"
              >
                <FaBookmark className="h-3 text-green-400" />
                <span className="xs:hidden">Bookmarks</span>
              </a>
            </Link>
          )}
          <Dropdown />
        </div>
      </div>

      <ul className="flex flex-col xs:flex-row xs:flex-wrap flex-1 xs:gap-4 xs:items-center xs:py-2 xs:border-t border-b border-gray-200 dark:border-gray-800 divide-y xs:divide-none divide-default">
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
          <ActiveLink href="/charts">Charts</ActiveLink>
        </li>
        <li>
          <ActiveLink href="/tools/blob">Tools</ActiveLink>
        </li>
      </ul>
    </nav>
  );
}
