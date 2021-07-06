import React from "react";
import GenesisAccount from "../../components/GenesisAccount";
import { MetaTags } from "../../components/MetaTags";
import NeuronNav from "../../components/Neurons/NeuronNav";
import Search404 from "../../components/Search404";

export async function getServerSideProps({ params }) {
  const { genesisAccount } = params;
  const isValid = !!genesisAccount && genesisAccount.match(/[0-9a-fA-F]{40}/);
  return { props: { isValid, genesisAccount } };
}

const GenesisAccountPage = ({
  isValid,
  genesisAccount,
}: {
  isValid: boolean;
  genesisAccount: string;
}) => {
  if (!isValid) {
    return <Search404 input={genesisAccount} />;
  }

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
