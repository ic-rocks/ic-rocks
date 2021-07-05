import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import CanisterPage from "../../components/CanisterPage";
import { CanistersTable } from "../../components/CanistersTable";
import CodeBlock from "../../components/CodeBlock";
import { MetaTags } from "../../components/MetaTags";
import SimpleTable from "../../components/Tables/SimpleTable";
import fetchJSON from "../../lib/fetch";
import { pluralize } from "../../lib/strings";
import { Module } from "../../lib/types/API";

const didc = import("didc");

const ModuleCanistersPage = () => {
  const router = useRouter();
  const { moduleId } = router.query as {
    moduleId: string;
  };

  const [bindings, setBindings] = useState(null);
  const { data } = useQuery<Module>(
    ["modules", moduleId],
    async () => fetchJSON(`/api/modules/${moduleId}`),
    { enabled: !!moduleId }
  );

  useEffect(() => {
    if (data?.candid) {
      didc.then((mod) => {
        const gen = mod.generate(data.candid);
        setBindings(gen);
      });
    }
  }, [data]);

  const [showInterface, setShowInterface] = useState(false);

  const rows = [
    [
      {
        contents: "Name",
        className: "w-24",
      },
      {
        contents: data?.name || "-",
      },
    ],
    [
      {
        contents: "Canisters",
        className: "w-24",
      },
      {
        contents:
          data == null
            ? "Searching for matching modules..."
            : data.canisterCount === 0
            ? "No canisters found with this module hash"
            : `${data.canisterCount} ${pluralize(
                "canister",
                data.canisterCount
              )} match this module hash on ${data.subnetCount} ${pluralize(
                "subnet",
                data.subnetCount
              )}`,
      },
    ],
    [
      {
        contents: "Source",
        className: "w-24",
      },
      {
        contents: data?.sourceUrl ? (
          <a href={data.sourceUrl} target="_blank" className="link-overflow">
            {data.sourceUrl}
          </a>
        ) : (
          "-"
        ),
      },
    ],
    [
      {
        contents: "Interface",
        className: "w-24",
      },
      {
        contents: data?.candid ? (
          <a
            className="cursor-pointer link-overflow"
            onClick={() => setShowInterface(!showInterface)}
          >
            {showInterface ? "Hide" : "Show"}
          </a>
        ) : (
          "-"
        ),
      },
    ],
  ];

  const header = {
    contents: (
      <>
        <label>Module Details</label>
        {data?.hasHttp && (
          <label className="font-normal label-tag bg-green-label">
            Serves HTTP
          </label>
        )}
      </>
    ),
    className: "flex-1 flex justify-between",
  };

  return (
    <CanisterPage>
      <MetaTags
        title={`Module ${moduleId}`}
        description={`Details for module${
          moduleId ? ` ${moduleId}` : ""
        } on the Internet Computer.`}
      />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Module <small className="text-xl break-all">{moduleId}</small>
      </h1>
      <section className="mb-8">
        <SimpleTable headers={[header]} rows={rows} />
      </section>
      {showInterface && (
        <CodeBlock className="mb-8" candid={data.candid} bindings={bindings} />
      )}
      {!!moduleId && (
        <section>
          <h2 className="text-2xl mb-4">Matching Canisters</h2>
          <CanistersTable name="matching-canisters" moduleId={moduleId} />
        </section>
      )}
    </CanisterPage>
  );
};

export default ModuleCanistersPage;
