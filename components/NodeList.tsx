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
    <table className="w-full table-fixed mt-8">
      <thead className="bg-heading">
        <tr className="flex py-2">
          <th className="flex-1 px-2">
            {type === "operator" ? "Operator" : "Provider"} of Nodes (
            {nodes.length})
          </th>
          <th className="flex-1 px-2">
            Subnet ({countBy(nodes, "subnet")} unique)
          </th>
          <th className="flex-1 px-2">
            {type === "operator" ? "Provider" : "Operator"} (
            {countBy(nodes, otherRole)} unique)
          </th>
        </tr>
      </thead>
      <tbody className="block divide-y divide-default">
        {nodes.map(({ nodeId, subnet, ...principals }) => {
          return (
            <tr key={nodeId} className="flex">
              <td className="px-2 py-0.5 flex-1 flex oneline">
                <Link href={`/node/${nodeId}`}>
                  <a className="link-overflow">{nodeId}</a>
                </Link>
              </td>
              <td className="px-2 py-0.5 flex-1 flex oneline">
                <Link href={`/subnet/${subnet}`}>
                  <a className="link-overflow">{subnet}</a>
                </Link>
              </td>
              <td className="px-2 py-0.5 flex-1 flex oneline">
                <Link href={`/principal/${principals[otherRole]}`}>
                  <a className="link-overflow">{principals[otherRole]}</a>
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
