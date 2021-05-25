import classnames from "classnames";
import Link from "next/link";
import React from "react";

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
        <ul className="font-mono">
          {canisterIds.map((canisterId) => (
            <li key={canisterId}>
              <Link href={`/canister/${canisterId}`}>
                <a className="hover:underline text-blue-600">{canisterId}</a>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <span> No known canisters</span>
      )}
    </div>
  );
}
