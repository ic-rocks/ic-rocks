import React from "react";
import MetricsDataChart from "../../components/Charts/MetricsDataChart";
import ChartsNav from "../../components/ChartsPages/ChartsNav";
import { MetaTags } from "../../components/MetaTags";

const MetricsCharts = () => {
  const title = "Metrics";

  return (
    <div className="pb-16">
      <MetaTags
        title={title}
        description="Custom metrics tracked by ic.rocks Metrics."
      />
      <ChartsNav />
      <h1 className="text-3xl my-8">{title}</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1].map((id) => (
          <div key={id}>
            <MetricsDataChart attributeId={id} />
          </div>
        ))}
      </section>
    </div>
  );
};

export default MetricsCharts;
