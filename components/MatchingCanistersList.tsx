import classnames from "classnames";
import React from "react";
import IdentifierLink from "./Labels/IdentifierLink";

export default function MatchingCanistersList({
  className,
  canisterIds,
}: {
  className?: string;
  canisterIds: string[];
}) {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    <div className={classnames(className, "mb-8")}>
      <span>Canisters with this interface:</span>
      {canisterIds.length > 0 ? (
        <ul>
          {canisterIds.map((canisterId) => (
            <li key={canisterId}>
              <IdentifierLink type="principal" id={canisterId} />
            </li>
          ))}
        </ul>
      ) : (
        <span> No known canisters</span>
      )}
    </div>
  );
}
