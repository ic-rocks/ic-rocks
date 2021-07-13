import React from "react";
import { ChartIds } from "../components/ChartsPages/ChartIds";
import ChartsNav from "../components/ChartsPages/ChartsNav";
import DataOverTimeChart from "../components/ChartsPages/DataOverTimeChart";
import { MetaTags } from "../components/MetaTags";

const ChartsPage = () => {
  const title = "Charts";

  return (
    <div className="pb-16">
      <MetaTags
        title={title}
        description="Charts on network and canister data on the Internet Computer."
      />
      <ChartsNav />
      <h1 className="text-3xl my-8">{title}</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ChartIds.map(({ id }) => (
          <DataOverTimeChart key={id} chartId={id} />
        ))}
      </section>
    </div>
  );
};

export default ChartsPage;
