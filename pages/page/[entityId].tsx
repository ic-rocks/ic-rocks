import classNames from "classnames";
import React, { useMemo } from "react";
import { MetaTags } from "../../components/MetaTags";
import SimpleTable from "../../components/Tables/SimpleTable";
import { API_ENDPOINT } from "../../config";
import fetchJSON from "../../lib/fetch";
import { Entity } from "../../lib/types/API";

export async function getServerSideProps({ params }) {
  let data;
  try {
    data = await fetchJSON(`${API_ENDPOINT}/entities/${params.entityId}`);
  } catch (error) {}
  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: data,
  };
}

const EntityPage = (data: Entity) => {
  const summaryRows = useMemo(() => {
    return [
      [
        { contents: "URL", className: "w-32" },
        {
          contents: data.url ? (
            <a href={data.url} target="_blank" className="link-overflow">
              {data.url}
            </a>
          ) : (
            "-"
          ),
        },
      ],
      [
        { contents: "Description", className: "w-32" },
        {
          contents: data.description || "-",
          className: classNames({ "text-xs": data.description.length > 200 }),
        },
      ],
      [
        { contents: "Principals", className: "w-32" },
        {
          contents: data.principalCount,
        },
      ],
      [
        { contents: "Canisters", className: "w-32" },
        {
          contents: data.canisterCount,
        },
      ],
      [
        { contents: "Accounts", className: "w-32" },
        {
          contents: data.accountCount,
        },
      ],
      [
        { contents: "Neurons", className: "w-32" },
        {
          contents: data.neuronCount,
        },
      ],
    ];
  }, [data]);

  return (
    <div className="pb-16">
      <MetaTags
        title={data.name}
        description={`Details for ${data.name} on the Internet Computer ledger.`}
      />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis flex items-center">
        {data.imageUrl && <img src={data.imageUrl} className="w-8 mr-2" />}
        {data.name}
      </h1>
      <section className="mb-8">
        <SimpleTable rows={summaryRows} />
      </section>
    </div>
  );
};

export default EntityPage;
