import React from "react";
import { ChartId, ChartTypes } from "../../components/ChartsPages/ChartIds";
import ChartsNav from "../../components/ChartsPages/ChartsNav";
import DataOverTimeChart from "../../components/ChartsPages/DataOverTimeChart";
import { MetaTags } from "../../components/MetaTags";

export async function getServerSideProps({ params }) {
  const { chartId } = params;
  if (!ChartTypes.find(({ id }) => chartId === id)) {
    return {
      notFound: true,
    };
  }

  return { props: { chartId } };
}

const ChartsPage = ({ chartId }: { chartId: ChartId }) => {
  const { heading, description } = ChartTypes.find(({ id }) => id === chartId);

  return (
    <div className="pb-16">
      <MetaTags
        title={heading}
        description={`Chart of ${heading} on the Internet Computer.`}
      />
      <ChartsNav />
      <h1 className="my-8 text-3xl">{heading}</h1>
      <div className="flex flex-col gap-4">
        {description}
        <DataOverTimeChart chartId={chartId} isFull={true} />
      </div>
    </div>
  );
};

export default ChartsPage;
