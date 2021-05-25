import classnames from "classnames";
import React from "react";

const CANDID_UI_URL = "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/";

export default function CanisterUI({
  className,
  candid,
  matches,
}: {
  className?: string;
  candid: string;
  matches: string[];
}) {
  if (typeof window === "undefined") {
    return null;
  }

  const payload = encodeURIComponent(window.btoa(candid));

  return (
    <div className={classnames(className, "mb-8")}>
      {matches.length > 0 ? (
        <>
          <span>Explore canisters:</span>
          <ul className="font-mono">
            {matches.map((canisterId) => (
              <li key={canisterId}>
                <a
                  className="hover:underline text-blue-600"
                  href={`${CANDID_UI_URL}?id=${canisterId}&did=${payload}`}
                  target="_blank"
                >
                  {canisterId}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <span>No known canisters.</span>
      )}
    </div>
  );
}
