import { Actor, HttpAgent, IDL } from "@dfinity/agent";
import extendProtobuf from "agent-pb";
import Link from "next/link";
import protobuf from "protobufjs";
import React from "react";
import NetworkGraph from "../../components/Charts/NetworkGraph";
import { MetaTitle } from "../../components/MetaTags";
import subnetsJson from "../../generated/subnets.json";
import protobufJson from "../../lib/canisters/proto.json";
declare const Buffer;

const root = protobuf.Root.fromJSON(protobufJson as protobuf.INamespace);
const agent = new HttpAgent({ host: "https://ic0.app" });
const registry = Actor.createActor(() => IDL.Service({}), {
  agent,
  canisterId: "rwlgt-iiaaa-aaaaa-aaaaa-cai",
});
extendProtobuf(registry, root.lookupService("Registry"));

export async function getStaticPaths() {
  return {
    paths: Object.keys(subnetsJson.nodes).map((nodeId) => ({
      params: { nodeId },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params: { nodeId } }) {
  const nodeRecord = subnetsJson.nodes[nodeId];
  const subnets = Object.entries(subnetsJson.subnets)
    .filter(([subnet, record]) => record.membership.find((n) => n === nodeId))
    .map(([subnet]) => subnet);
  return {
    props: {
      nodeId,
      nodeRecord,
      subnets,
    },
  };
}

const NodePage = ({ nodeId, nodeRecord, subnets }) => {
  return (
    <div className="py-16">
      <MetaTitle title={`Node ${nodeId}`} />
      <h1 className="text-3xl mb-8 overflow-hidden overflow-ellipsis">
        Node <small className="text-2xl">{nodeId}</small>
      </h1>
      <table className="w-full table-fixed">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr className="invisible">
            <td className="w-1/4" />
            <td className="w-3/4" />
          </tr>
          <tr>
            <th colSpan={2} className="px-2 py-2">
              Node Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
          <tr>
            <td className="px-2 py-2 w-1/4">Node Operator</td>
            <td className="px-2 py-2 w-3/4 overflow-hidden overflow-ellipsis">
              <Link
                href={`/principal/${nodeRecord.nodeOperator.value.nodeOperatorPrincipalId}`}
              >
                <a className="text-blue-600 hover:underline">
                  {nodeRecord.nodeOperator.value.nodeOperatorPrincipalId}
                </a>
              </Link>
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Node Provider</td>
            <td className="px-2 py-2 w-3/4 overflow-hidden overflow-ellipsis">
              <Link
                href={`/principal/${nodeRecord.nodeOperator.value.nodeProviderPrincipalId}`}
              >
                <a className="text-blue-600 hover:underline">
                  {nodeRecord.nodeOperator.value.nodeProviderPrincipalId}
                </a>
              </Link>
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Subnet</td>
            <td className="px-2 py-2 w-3/4 overflow-hidden overflow-ellipsis">
              {subnets.map((subnet) => {
                return (
                  <Link key={subnet} href={`/subnet/${subnet}`}>
                    <a className="text-blue-600 hover:underline">{subnet}</a>
                  </Link>
                );
              })}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Node Allowance</td>
            <td className="px-2 py-2 w-3/4 overflow-hidden overflow-ellipsis">
              {nodeRecord.nodeOperator.value.nodeAllowance || "-"}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Registry Version</td>
            <td className="px-2 py-2 w-3/4">
              {nodeRecord.nodeOperator.version}
            </td>
          </tr>
        </tbody>
      </table>
      <NetworkGraph activeId={nodeId} activeType="Node" />
    </div>
  );
};

export default NodePage;
