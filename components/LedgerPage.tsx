import React from "react";

const Ledger = ({ title, children }) => {
  return (
    <div className="pb-16">
      <h1 className="text-3xl my-8">{title}</h1>
      {children}
    </div>
  );
};
export default Ledger;
