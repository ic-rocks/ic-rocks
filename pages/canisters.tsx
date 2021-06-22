import React from "react";
import CanisterPage from "../components/CanisterPage";
import { CanistersTable } from "../components/CanistersTable";
import { MetaTags } from "../components/MetaTags";

const Canisters = () => {
  const title = "Canisters";

  return (
    <CanisterPage>
      <MetaTags
        title={title}
        description="A list of known canisters on the Internet Computer."
      />
      <h1 className="text-3xl my-8">{title}</h1>
      <CanistersTable name="canisters" />
    </CanisterPage>
  );
};

export default Canisters;
