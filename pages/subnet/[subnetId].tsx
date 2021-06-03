import React from "react";
import { MetaTitle } from "../../components/MetaTags";
import { NodeList } from "../../components/NodeList";
import subnetsJson from "../../generated/subnets.json";
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
  const subnetRecord = subnetsJson.subnets[subnetId];
  return {
    props: {
      subnetId,
      subnetRecord,
    },
  };
}

const Subnet = ({ subnetId, subnetRecord }) => {
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
              {getSubnetType(subnetRecord.subnetType)}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Replica Version</td>
            <td className="px-2 py-2 w-3/4 overflow-hidden overflow-ellipsis">
              {subnetRecord.replicaVersionId}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Nodes</td>
            <td className="px-2 py-2 w-3/4">
              {formatNumber(subnetRecord.membership.length)}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Registry Version</td>
            <td className="px-2 py-2 w-3/4">{subnetRecord.version}</td>
          </tr>
        </tbody>
      </table>

      <NodeList title="Nodes" nodes={subnetRecord.membership} />
    </div>
  );
};

export default Subnet;
