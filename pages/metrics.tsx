import React from "react";
import MetricsDataChart from "../components/Charts/MetricsDataChart";
import { MetaTags } from "../components/MetaTags";

const Canisters = () => {
  const title = "Metrics";

  return (
    <div className="pb-16">
      <MetaTags
        title={title}
        description="A list of known canisters on the Internet Computer."
      />
      <h1 className="text-3xl my-8">{title}</h1>
      <section className="grid grid-cols-3 gap-4">
        {[0, 1].map((id) => (
          <div key={id}>
            <MetricsDataChart attributeId={id} />
          </div>
        ))}
      </section>
    </div>
  );
};

export default Canisters;
