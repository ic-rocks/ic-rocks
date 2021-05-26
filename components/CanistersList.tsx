import Link from "next/link";
import React from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";

SyntaxHighlighter.registerLanguage("json", json);

export default function CanistersList({
  className,
  canisters,
}: {
  className?: string;
  canisters: object;
}) {
  return (
    <div className={className}>
      <table className="table-auto w-full">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-2 py-2">Canister ID</th>
            <th className="px-2 py-2">Name</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
          {Object.entries(canisters).map(([canisterId, name]) => {
            return (
              <tr key={canisterId}>
                <td className="px-2">
                  <Link href={`/principal/${canisterId}`}>
                    <a className="hover:underline text-blue-600">
                      {canisterId}
                    </a>
                  </Link>
                </td>
                <td className="px-2">{name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
