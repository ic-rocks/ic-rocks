import React from "react";
import { MetaTags } from "../components/MetaTags";
import GovernanceStats from "../components/Neurons/GovernanceStats";
import NeuronNav from "../components/Neurons/NeuronNav";
import { NeuronsStats } from "../components/Neurons/NeuronsStats";
import NeuronsTable from "../components/Neurons/NeuronsTable";

const NeuronsPage = () => {
  return (
    <div className="pb-16">
      <MetaTags
        title="Neurons"
        description={`Overview of neurons on the Internet Computer.`}
      />
      <NeuronNav />
      <h1 className="overflow-hidden my-8 text-3xl overflow-ellipsis">
        Known Neurons
      </h1>
      <section className="mb-8">
        <NeuronsStats />
      </section>
      <section className="mb-8">
        <GovernanceStats />
      </section>
      <NeuronsTable name="neurons" />
    </div>
  );
};

export default NeuronsPage;
