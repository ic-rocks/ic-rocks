import React from "react";
import RecentCanistersBox from "../components/InfoBoxes/RecentCanistersBox";
import RecentTransactionsBox from "../components/InfoBoxes/RecentTransactionsBox";
import StatsBoxes from "../components/InfoBoxes/StatsBoxes";
import { homeDescription, MetaTags } from "../components/MetaTags";

export default function Home() {
  return (
    <div className="py-16">
      <MetaTags
        title="ic.rocks | Internet Computer Explorer"
        suffix={false}
        image="hero"
        description={homeDescription}
      />
      <h1 className="text-3xl mb-16">The Internet Computer rocks</h1>
      <StatsBoxes />
      <section className="grid md:grid-cols-2 gap-8 justify-center items-stretch">
        <RecentCanistersBox />
        <RecentTransactionsBox />
      </section>
    </div>
  );
}
