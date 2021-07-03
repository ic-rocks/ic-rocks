import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import NetworkGraph from "../../components/Charts/NetworkGraph";
import IdentifierLink from "../../components/Labels/IdentifierLink";
import { MetaTags } from "../../components/MetaTags";
import { countBy } from "../../lib/arrays";
import fetchJSON from "../../lib/fetch";
import { formatNumber } from "../../lib/numbers";
import { SubnetResponse } from "../../lib/types/API";

const Subnet = () => {
  const router = useRouter();
  const { subnetId } = router.query as {
    subnetId?: string;
  };
  const [data, setData] = useState<SubnetResponse>(null);
  useEffect(() => {
    if (!subnetId) return;
    fetchJSON(`/api/subnets/${subnetId}`).then(setData);
  }, [subnetId]);

  return (
    <div className="pb-16">
      <MetaTags
        title={`Subnet ${subnetId}`}
        description={`Details for subnet ${subnetId} on the Internet Computer.`}
      />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Subnet <small className="text-xl">{subnetId}</small>
      </h1>
      <table className="w-full table-fixed">
        <thead className="bg-heading">
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
              {data?.subnetType || "-"}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Nodes</td>
            <td className="px-2 py-2 w-3/4">
              {data ? formatNumber(data.nodeCount) : "-"}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Unique Operators</td>
            <td className="px-2 py-2 w-3/4">
              {data ? countBy(data.nodes, (d) => d.operator.id) : "-"}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Unique Providers</td>
            <td className="px-2 py-2 w-3/4">
              {data ? countBy(data.nodes, (d) => d.provider.id) : "-"}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Total Canisters</td>
            <td className="px-2 py-2 w-3/4">
              {data ? data.canisterCount : "-"}
            </td>
          </tr>
        </tbody>
      </table>

      {data && <NetworkGraph activeId={subnetId} activeType="Subnet" />}

      <h2 className="text-2xl mt-8 mb-4">Nodes</h2>
      <table className="w-full table-fixed">
        <thead className="bg-heading">
          <tr className="flex">
            <th className="text-left px-2 py-2 flex-1">Node</th>
            <th className="text-left px-2 py-2 flex-1">Operator</th>
            <th className="text-left px-2 py-2 flex-1">Provider</th>
          </tr>
        </thead>
        <tbody className="block divide-y divide-gray-300 dark:divide-gray-700">
          {data?.nodes.map(({ id, operator, provider }) => {
            return (
              <tr key={id} className="flex">
                <td className="px-2 py-0.5 flex-1 flex oneline">
                  <Link href={`/node/${id}`}>
                    <a className="link-overflow">{id}</a>
                  </Link>
                </td>
                <td className="px-2 py-0.5 flex-1 flex oneline">
                  <IdentifierLink
                    type="principal"
                    name={operator.name}
                    id={operator.id}
                  />
                </td>
                <td className="px-2 py-0.5 flex-1 flex oneline">
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
