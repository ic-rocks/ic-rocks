import Link from "next/link";
import React from "react";

export const NodeList = ({
  title,
  nodes,
}: {
  title: string;
  nodes: string[];
}) => {
  return (
    <table className="w-full mt-8">
      <thead className="bg-gray-100 dark:bg-gray-800">
        <tr>
          <th className="text-left px-2 py-2">{title}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
        {nodes.map((nodeId) => {
          return (
            <tr key={nodeId}>
              <td className="px-2 py-0.5 overflow-hidden overflow-ellipsis text-blue-600">
                <Link href={`/node/${nodeId}`}>
                  <a className="hover:underline">{nodeId}</a>
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
