import Link from "next/link";
import React from "react";
import NetworkGraph from "../components/Charts/NetworkGraph";
import { MetaTitle } from "../components/MetaTags";
import subnetsJson from "../generated/subnets.json";
import { getSubnetType } from "../lib/network";

const Network = () => {
  const subnets = Object.entries(subnetsJson.subnets);
  const title = "Network";

  return (
    <div className="py-16">
      <MetaTitle title={title} />
      <h1 className="text-3xl mb-8">{title}</h1>
      <NetworkGraph />
      <section>
        <table className="w-full mt-8">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left px-2 py-2">
                Subnets ({subnets.length})
              </th>
              <th className="text-left px-2 py-2">Type</th>
              <th className="text-left px-2 py-2">Nodes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
            {subnets.map(([subnetId, { membership, subnetType }]) => {
              return (
                <tr key={subnetId}>
                  <td className="px-2 py-1 overflow-hidden overflow-ellipsis text-blue-600">
                    <Link href={`/subnet/${subnetId}`}>
                      <a className="hover:underline">{subnetId}</a>
                    </Link>
                  </td>
                  <td className="px-2 py-1">{getSubnetType(subnetType)}</td>
                  <td className="px-2 py-1">{membership.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Network;
