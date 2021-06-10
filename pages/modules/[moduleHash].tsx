import { useRouter } from "next/router";
import React from "react";
import CanisterPage from "../../components/CanisterPage";
import { CanistersTable } from "../../components/CanistersTable";
import { MetaTitle } from "../../components/MetaTags";

const ModuleCanistersPage = () => {
  const router = useRouter();
  const { moduleHash } = router.query as {
    moduleHash?: string;
  };

  return (
    <CanisterPage>
      <MetaTitle title={`Module ${moduleHash}`} />
      <h1 className="text-3xl mb-8 overflow-hidden overflow-ellipsis">
        Module <small className="text-2xl">{moduleHash}</small>
      </h1>
      <CanistersTable key={moduleHash} moduleHash={moduleHash} />
    </CanisterPage>
  );
};

export default ModuleCanistersPage;
