import { useRouter } from "next/router";
import React from "react";
import GenesisAccount from "../../components/GenesisAccount";
import { MetaTags } from "../../components/MetaTags";
import NeuronNav from "../../components/Neurons/NeuronNav";

const GenesisAccountPage = () => {
  const router = useRouter();
  const { genesisAccount } = router.query as { genesisAccount: string };

  return (
    <div className="pb-16">
      <MetaTags
        title={`Genesis Account ${genesisAccount}`}
        description={`Details for genesis account ${genesisAccount} on the Internet Computer.`}
      />
      <NeuronNav />
      <GenesisAccount genesisAccount={genesisAccount} />
    </div>
  );
};

export default GenesisAccountPage;
