import { useRouter } from "next/router";
import React, { useState } from "react";
import CanisterPage from "../../components/CanisterPage";
import { CanistersTable } from "../../components/CanistersTable";
import { MetaTags } from "../../components/MetaTags";
import { pluralize } from "../../lib/strings";

const ModuleCanistersPage = () => {
  const router = useRouter();
  const { moduleHash } = router.query as {
    moduleHash?: string;
  };
  const [matches, setMatches] = useState(null);
  const onFetch = (res) => {
    setMatches(res?.count || 0);
  };

  return (
    <CanisterPage>
      <MetaTags
        title={`Module ${moduleHash}`}
        description={`Details for module${
          moduleHash ? ` ${moduleHash}` : ""
        } on the Internet Computer.`}
      />
      <h1 className="text-3xl mb-8 overflow-hidden overflow-ellipsis">
        Module <small className="text-xl break-all">{moduleHash}</small>
      </h1>
      <p className="mb-8">
        {matches == null
          ? "Searching for matching modules..."
          : matches === 0
          ? "No canisters found with this module hash."
          : `This module hash matches ${matches} ${pluralize(
              "canister",
              matches
            )}.`}
      </p>
      {!!moduleHash && (
        <CanistersTable moduleHash={moduleHash} onFetch={onFetch} />
      )}
    </CanisterPage>
  );
};

export default ModuleCanistersPage;
