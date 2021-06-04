import Link from "next/link";
import React from "react";
import { MetaTitle } from "../../components/MetaTags";
import subnetsJson from "../../generated/subnets.json";
import { countBy } from "../../lib/arrays";
import { getSubnetType } from "../../lib/network";
import { formatNumber } from "../../lib/numbers";
declare const Buffer;

export async function getStaticPaths() {
  return {
    paths: Object.keys(subnetsJson.subnets).map((subnetId) => ({
      params: { subnetId },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params: { subnetId } }) {
  const { subnetType, replicaVersionId, version, membership } =
    subnetsJson.subnets[subnetId];
  const nodes = membership.map((nodeId) => {
    const { nodeOperatorPrincipalId, nodeProviderPrincipalId } =
      subnetsJson.nodes[nodeId].nodeOperator.value;
    return {
      nodeId,
      operator: nodeOperatorPrincipalId,
      provider: nodeProviderPrincipalId,
    };
  });

  return {
    props: {
      subnetId,
      subnetType: getSubnetType(subnetType),
      nodes,
      version,
      replicaVersionId,
    },
  };
}

const Subnet = ({
  subnetId,
  subnetType,
  nodes,
  version,
  replicaVersionId,
}: {
  subnetId: string;
  subnetType: string;
  nodes: any[];
  version: string;
  replicaVersionId: string;
}) => {
  return (
    <div className="py-16">
      <MetaTitle title={`Subnet ${subnetId}`} />
      <h1 className="text-3xl mb-8 overflow-hidden overflow-ellipsis">
        Subnet <small className="text-2xl">{subnetId}</small>
      </h1>
      <table className="w-full table-fixed">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr className="invisible">
            <td className="w-1/4" />
            <td className="w-3/4" />
          </tr>
          <tr>
            <th colSpan={2} className="px-2 py-2">
              Subnet Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
          <tr>
            <td className="px-2 py-2 w-1/4">Type</td>
            <td className="px-2 py-2 w-3/4 overflow-hidden overflow-ellipsis">
              {subnetType}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Replica Version</td>
            <td className="px-2 py-2 w-3/4 overflow-hidden overflow-ellipsis">
              {replicaVersionId}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Nodes</td>
            <td className="px-2 py-2 w-3/4">{formatNumber(nodes.length)}</td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Unique Operators</td>
            <td className="px-2 py-2 w-3/4">{countBy(nodes, "operator")}</td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Unique Providers</td>
            <td className="px-2 py-2 w-3/4">{countBy(nodes, "provider")}</td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Registry Version</td>
            <td className="px-2 py-2 w-3/4">{version}</td>
          </tr>
        </tbody>
      </table>

      <table className="w-full mt-8">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="text-left px-2 py-2">Node</th>
            <th className="text-left px-2 py-2">Operator</th>
            <th className="text-left px-2 py-2">Provider</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
          {nodes.map(({ nodeId, operator, provider }) => {
            return (
              <tr key={nodeId}>
                <td className="px-2 py-0.5 overflow-hidden overflow-ellipsis text-blue-600">
                  <Link href={`/node/${nodeId}`}>
                    <a className="hover:underline">{nodeId}</a>
                  </Link>
                </td>
                <td className="px-2 py-0.5 overflow-hidden overflow-ellipsis text-blue-600">
                  <Link href={`/principal/${operator}`}>
                    <a className="hover:underline">{operator}</a>
                  </Link>
                </td>
                <td className="px-2 py-0.5 overflow-hidden overflow-ellipsis text-blue-600">
                  <Link href={`/principal/${provider}`}>
                    <a className="hover:underline">{provider}</a>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Subnet;
