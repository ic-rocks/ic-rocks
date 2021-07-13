import React from "react";
import { ChartId, ChartIds } from "../../components/ChartsPages/ChartIds";
import ChartsNav from "../../components/ChartsPages/ChartsNav";
import DataOverTimeChart from "../../components/ChartsPages/DataOverTimeChart";
import { MetaTags } from "../../components/MetaTags";

export async function getServerSideProps({ params }) {
  const { chartId } = params;
  if (!ChartIds.find(({ id }) => chartId === id)) {
    return {
      notFound: true,
    };
  }

  return { props: { chartId } };
}

const ChartsPage = ({ chartId }: { chartId: ChartId }) => {
  const { heading } = ChartIds.find(({ id }) => id === chartId);

  return (
    <div className="pb-16">
      <MetaTags
        title={heading}
        description="Charts on network and canister data on the Internet Computer."
      />
      <ChartsNav />
      <h1 className="text-3xl my-8">{heading} Chart</h1>
      <DataOverTimeChart chartId={chartId} isFull={true} />
    </div>
  );
};

export default ChartsPage;
