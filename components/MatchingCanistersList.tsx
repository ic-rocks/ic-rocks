import classnames from "classnames";
import React from "react";
import PrincipalLink from "./Labels/PrincipalLink";

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
              <PrincipalLink principalId={canisterId} />
            </li>
          ))}
        </ul>
      ) : (
        <span> No known canisters</span>
      )}
    </div>
  );
}
