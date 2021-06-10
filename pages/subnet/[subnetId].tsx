import Link from "next/link";
import React, { useEffect, useState } from "react";
import NetworkGraph from "../../components/Charts/NetworkGraph";
import { MetaTitle } from "../../components/MetaTags";
import subnetsJson from "../../generated/subnets.json";
import { countBy } from "../../lib/arrays";
import fetchJSON from "../../lib/fetch";
import { getSubnetType } from "../../lib/network";
import { formatNumber } from "../../lib/numbers";

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
  replicaVersionId,
}: {
  subnetId: string;
  subnetType: string;
  nodes: any[];
  replicaVersionId: string;
}) => {
  const [canisters, setCanisters] = useState(null);
  useEffect(() => {
    fetchJSON(
      `/api/canisters?` +
        new URLSearchParams({
          subnetId,
        })
    ).then(setCanisters);
  }, []);

  return (
    <div className="py-16">
      <MetaTitle title={`Subnet ${subnetId}`} />
      <h1 className="text-3xl mb-8 overflow-hidden overflow-ellipsis">
        Subnet <small className="text-xl">{subnetId}</small>
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
            <td className="px-2 py-2 w-1/4">Total Canisters</td>
            <td className="px-2 py-2 w-3/4">
              {canisters ? canisters.count : "-"}
            </td>
          </tr>
        </tbody>
      </table>

      <NetworkGraph activeId={subnetId} activeType="Subnet" />

      <h2 className="text-2xl mt-8 mb-4">Nodes</h2>
      <table className="w-full table-fixed">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr className="flex">
            <th className="text-left px-2 py-2 flex-1">Node</th>
            <th className="text-left px-2 py-2 flex-1">Operator</th>
            <th className="text-left px-2 py-2 flex-1">Provider</th>
          </tr>
        </thead>
        <tbody className="block divide-y divide-gray-300 dark:divide-gray-700">
          {nodes.map(({ nodeId, operator, provider }) => {
            return (
              <tr key={nodeId} className="flex">
                <td className="px-2 py-0.5 flex-1 flex overflow-hidden whitespace-nowrap">
                  <Link href={`/node/${nodeId}`}>
                    <a className="link-overflow">{nodeId}</a>
                  </Link>
                </td>
                <td className="px-2 py-0.5 flex-1 flex overflow-hidden whitespace-nowrap">
                  <Link href={`/principal/${operator}`}>
                    <a className="link-overflow">{operator}</a>
                  </Link>
                </td>
                <td className="px-2 py-0.5 flex-1 flex overflow-hidden whitespace-nowrap">
                  <Link href={`/principal/${provider}`}>
                    <a className="link-overflow">{provider}</a>
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
