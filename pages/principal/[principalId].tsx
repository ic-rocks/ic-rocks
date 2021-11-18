import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useQuery } from "react-query";
import CandidUI from "../../components/CandidUI";
import { CanistersTable } from "../../components/CanistersTable";
import NetworkGraph from "../../components/Charts/NetworkGraph";
import CodeBlock from "../../components/CodeBlock";
import GenesisAccount from "../../components/GenesisAccount";
import { MetaTags } from "../../components/MetaTags";
import PrincipalDetails from "../../components/PrincipalDetails";
import { PrincipalNodesTable } from "../../components/PrincipalNodesTable";
import Search404 from "../../components/Search404";
import fetchJSON from "../../lib/fetch";
import { useCandid } from "../../lib/hooks/useCandid";
import { getPrincipalType } from "../../lib/identifiers";
import { APIPrincipal, Canister } from "../../lib/types/API";
import { PrincipalType } from "../../lib/types/PrincipalType";

export async function getServerSideProps({ params }) {
  const { principalId } = params;
  return { props: { type: getPrincipalType(principalId), principalId } };
}

const PrincipalPage = ({
  principalId,
  type,
}: {
  principalId: string;
  type: PrincipalType | null;
}) => {
  if (!type) {
    return <Search404 input={principalId} />;
  }

  const router = useRouter();
  const { candid: candidOverride } = router.query as {
    candid?: string;
  };
  const { bindings, candid, protobuf } = useCandid(principalId, type);

  const { data: canisterData } = useQuery<Canister>(
    ["canisters", principalId],
    () => fetchJSON(`/api/canisters/${principalId}`),
    {
      enabled: type === "Canister",
    }
  );

  const { data: principalData } = useQuery<APIPrincipal>(
    ["principals", principalId],
    () => fetchJSON(`/api/principals/${principalId}`)
  );

  useEffect(() => {
    if (principalData?.node) {
      router.replace(`/node/${principalId}`);
    }
  }, [principalData]);

  const showNodes =
    principalData?.operatorOf.length > 0 ||
    principalData?.providerOf.length > 0;
  return (
    <div className="pb-16">
      <MetaTags
        title={`Principal ${principalId}`}
        description={`Details for principal ${principalId} on the Internet Computer.`}
      />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Principal <small className="text-xl">{principalId}</small>
      </h1>
      <PrincipalDetails
        principalId={principalId}
        type={type}
        principalData={principalData}
        canisterData={canisterData}
        className="mb-8"
      />
      {principalData?.genesisAccount?.id && (
        <GenesisAccount genesisAccount={principalData.genesisAccount.id} />
      )}
      {principalData?.canisterCount > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl mb-4">Controlled Canisters</h2>
          <CanistersTable
            name="controlled-canisters"
            controllerId={principalId}
          />
        </section>
      )}
      {candid && (
        <section>
          <h2 className="text-2xl mb-4">Canister Interface</h2>
          {bindings && (
            <CandidUI
              key={principalId}
              candid={candid}
              canisterId={principalId}
              jsBindings={bindings.js}
              protobuf={protobuf}
              className="mb-8"
              isAttached={!!candidOverride}
            />
          )}
          <CodeBlock candid={candid} bindings={bindings} protobuf={protobuf} />
        </section>
      )}
      {showNodes ? (
        <>
          <NetworkGraph activeId={principalId} activeType="Principal" />
          <PrincipalNodesTable data={principalData} />
        </>
      ) : null}
    </div>
  );
};

export default PrincipalPage;
