import Link from "next/link";
import React from "react";
import { useQuery } from "react-query";
import NetworkGraph from "../../components/Charts/NetworkGraph";
import IdentifierLink from "../../components/Labels/IdentifierLink";
import { MetaTags } from "../../components/MetaTags";
import { countBy } from "../../lib/arrays";
import fetchJSON from "../../lib/fetch";
import { getPrincipalType } from "../../lib/identifiers";
import { formatNumber } from "../../lib/numbers";
import { SubnetResponse } from "../../lib/types/API";

export async function getServerSideProps({ params }) {
  const { subnetId } = params;
  return { props: { isValid: !!getPrincipalType(subnetId), subnetId } };
}

const Subnet = ({
  subnetId,
  isValid,
}: {
  subnetId: string;
  isValid: boolean;
}) => {
  const { data } = useQuery<SubnetResponse>(
    ["subnets", subnetId],
    () => fetchJSON(`/api/subnets/${subnetId}`),
    { enabled: isValid, staleTime: Infinity }
  );

  return (
    <div className="pb-16">
      <MetaTags
        title={`Subnet ${subnetId}`}
        description={`Details for subnet ${subnetId} on the Internet Computer.`}
      />
      <h1 className="overflow-hidden my-8 text-3xl overflow-ellipsis">
        Subnet <small className="text-xl">{subnetId}</small>
      </h1>
      <table className="w-full table-fixed">
        <thead className="bg-heading">
          <tr className="invisible">
            <td className="w-1/4" />
            <td className="w-3/4" />
          </tr>
          <tr>
            <th colSpan={2} className="py-2 px-2">
              Subnet Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
          <tr>
            <td className="py-2 px-2 w-1/4">Type</td>
            <td className="overflow-hidden py-2 px-2 w-3/4 overflow-ellipsis">
              {data?.subnetType || "-"}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-2 w-1/4">Nodes</td>
            <td className="py-2 px-2 w-3/4">
              {data ? formatNumber(data.nodeCount) : "-"}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-2 w-1/4">Unique Operators</td>
            <td className="py-2 px-2 w-3/4">
              {data ? countBy(data.nodes, (d) => d.operator.id) : "-"}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-2 w-1/4">Unique Providers</td>
            <td className="py-2 px-2 w-3/4">
              {data ? countBy(data.nodes, (d) => d.provider.id) : "-"}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-2 w-1/4">Total Canisters</td>
            <td className="py-2 px-2 w-3/4">
              {data ? data.canisterCount : "-"}
            </td>
          </tr>
        </tbody>
      </table>

      {data && <NetworkGraph activeId={subnetId} activeType="Subnet" />}

      <h2 className="mt-8 mb-4 text-2xl">Nodes</h2>
      <table className="w-full table-fixed">
        <thead className="bg-heading">
          <tr className="flex">
            <th className="flex-1 py-2 px-2 text-left">Node</th>
            <th className="flex-1 py-2 px-2 text-left">Operator</th>
            <th className="flex-1 py-2 px-2 text-left">Provider</th>
          </tr>
        </thead>
        <tbody className="block divide-y divide-gray-300 dark:divide-gray-700">
          {data?.nodes.map(({ id, operator, provider }) => {
            return (
              <tr key={id} className="flex">
                <td className="flex flex-1 py-0.5 px-2 oneline">
                  <Link href={`/node/${id}`}>
                    <a className="link-overflow">{id}</a>
                  </Link>
                </td>
                <td className="flex flex-1 py-0.5 px-2 oneline">
                  <IdentifierLink
                    type="principal"
                    name={operator.name}
                    id={operator.id}
                  />
                </td>
                <td className="flex flex-1 py-0.5 px-2 oneline">
                  <IdentifierLink
                    type="principal"
                    name={provider.name}
                    id={provider.id}
                  />
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
