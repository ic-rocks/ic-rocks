import Link from "next/link";
import React from "react";
import { useQuery } from "react-query";
import NetworkGraph from "../../components/Charts/NetworkGraph";
import IdentifierLink from "../../components/Labels/IdentifierLink";
import { MetaTags } from "../../components/MetaTags";
import Search404 from "../../components/Search404";
import fetchJSON from "../../lib/fetch";
import { getPrincipalType } from "../../lib/identifiers";
import { NodeResponse } from "../../lib/types/API";

export async function getServerSideProps({ params }) {
  const { nodeId } = params;
  return { props: { isValid: !!getPrincipalType(nodeId), nodeId } };
}

const NodePage = ({
  nodeId,
  isValid,
}: {
  nodeId: string;
  isValid: boolean;
}) => {
  if (!isValid) {
    return <Search404 input={nodeId} />;
  }

  const { data } = useQuery<NodeResponse>(
    ["nodes", nodeId],
    () => fetchJSON(`/api/nodes/${nodeId}`),
    { staleTime: Infinity }
  );

  return (
    <div className="pb-16">
      <MetaTags
        title={`Node ${nodeId}`}
        description={`Details for node ${nodeId} on the Internet Computer.`}
      />
      <h1 className="text-3xl my-8 overflow-hidden">
        Node <small className="text-xl">{nodeId}</small>
      </h1>
      <table className="w-full table-fixed">
        <thead className="bg-heading">
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
            <td className="px-2 py-2 w-3/4 overflow-hidden">
              {data?.operator ? (
                <IdentifierLink
                  type="principal"
                  name={data.operator.name}
                  id={data.operator.id}
                />
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Node Provider</td>
            <td className="px-2 py-2 w-3/4 overflow-hidden">
              {data?.provider ? (
                <IdentifierLink
                  type="principal"
                  name={data.provider.name}
                  id={data.provider.id}
                />
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Subnet</td>
            <td className="px-2 py-2 w-3/4 overflow-hidden">
              {data?.subnet ? (
                <Link href={`/subnet/${data.subnet.id}`}>
                  <a className="link-overflow">
                    {data.subnet.subnetType} {data.subnet.id}
                  </a>
                </Link>
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Node Allowance</td>
            <td className="px-2 py-2 w-3/4 overflow-hidden">
              {data?.operator?.operatorAllowance || "-"}
            </td>
          </tr>
        </tbody>
      </table>
      {data?.subnet && <NetworkGraph activeId={nodeId} activeType="Node" />}
    </div>
  );
};

export default NodePage;
