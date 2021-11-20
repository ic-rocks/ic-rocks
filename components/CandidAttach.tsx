import { Principal } from "@dfinity/principal";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function CandidAttach({
  candid,
}: {
  className?: string;
  candid: string;
}) {
  const [canister, setCanister] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = (e) => {
    e.preventDefault();
    try {
      Principal.fromText(canister);
    } catch (error) {
      setError(error.message);
      return;
    }

    const url = `/principal/${canister}?candid=${encodeURIComponent(
      window.btoa(candid),
    )}`;
    router.push(url);
  };

  return (
    <div className="flex flex-col mb-8">
      <label>Attach this interface to a canister</label>
      <form className="flex" onSubmit={onSubmit}>
        <input
          placeholder="Canister ID"
          className="py-1 px-2 w-64 text-sm bg-gray-100 dark:bg-gray-800"
          type="text"
          onChange={(e) => setCanister(e.target.value)}
          value={canister}
          required={true}
        />
        <input type="submit" value="Go" className="ml-2 w-16 btn-default" />
      </form>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
