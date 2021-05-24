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
      <table className="table-auto w-full border-collapse border border-gray-800">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="border border-gray-400 px-2">Canister ID</th>
            <th className="border border-gray-400 px-2">Interface</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(canisters).map(([canisterId, name]) => {
            return (
              <tr key={canisterId} className="">
                <td className="border border-gray-400 px-2 font-mono text-sm">
                  {canisterId}
                </td>
                <td className="border border-gray-400 px-2">{name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
