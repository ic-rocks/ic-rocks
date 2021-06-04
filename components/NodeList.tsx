import Link from "next/link";
import React from "react";
import { countBy } from "../lib/arrays";

export const PrincipalNodesList = ({
  type,
  nodes,
}: {
  type: string;
  nodes: any[];
}) => {
  const otherRole = type === "operator" ? "provider" : "operator";

  return (
    <table className="w-full mt-8">
      <thead className="bg-gray-100 dark:bg-gray-800">
        <tr>
          <th className="text-left px-2 py-2">
            {type === "operator" ? "Operator" : "Provider"} of Nodes (
            {nodes.length})
          </th>
          <th className="text-left px-2 py-2">
            Subnet ({countBy(nodes, "subnet")} unique)
          </th>
          <th className="text-left px-2 py-2">
            {type === "operator" ? "Provider" : "Operator"} (
            {countBy(nodes, otherRole)} unique)
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
        {nodes.map(({ nodeId, subnet, ...principals }) => {
          return (
            <tr key={nodeId}>
              <td className="px-2 py-0.5 overflow-hidden overflow-ellipsis text-blue-600">
                <Link href={`/node/${nodeId}`}>
                  <a className="hover:underline">{nodeId}</a>
                </Link>
              </td>
              <td className="px-2 py-0.5 overflow-hidden overflow-ellipsis text-blue-600">
                <Link href={`/subnet/${subnet}`}>
                  <a className="hover:underline">{subnet}</a>
                </Link>
              </td>
              <td className="px-2 py-0.5 overflow-hidden overflow-ellipsis text-blue-600">
                <Link href={`/principal/${principals[otherRole]}`}>
                  <a className="hover:underline">{principals[otherRole]}</a>
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
