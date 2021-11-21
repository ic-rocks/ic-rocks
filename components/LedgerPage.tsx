import React from "react";

const Ledger = ({ title, children }) => {
  return (
    <div className="pb-16">
      <h1 className="my-8 text-3xl">{title}</h1>
      {children}
    </div>
  );
};
export default Ledger;
