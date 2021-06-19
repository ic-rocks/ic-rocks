import { useRouter } from "next/router";
import React from "react";
import ActiveLink from "../../components/ActiveLink";
import GenesisAccount from "../../components/GenesisAccount";
import { MetaTags } from "../../components/MetaTags";
import { SecondaryNav } from "../../components/Nav/SecondaryNav";

const GenesisAccountPage = () => {
  const router = useRouter();
  const { genesisAccount } = router.query as { genesisAccount: string };

  return (
    <div className="pb-16">
      <MetaTags
        title={`Genesis Account ${genesisAccount}`}
        description={`Details for genesis account ${genesisAccount} on the Internet Computer.`}
      />
      <SecondaryNav
        items={[
          <ActiveLink href="/neurons">Neurons</ActiveLink>,
          <ActiveLink href="/genesis">Genesis Accounts</ActiveLink>,
        ]}
      />
      <GenesisAccount genesisAccount={genesisAccount} />
    </div>
  );
};

export default GenesisAccountPage;
