import { Principal } from "@dfinity/principal";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { isAccount, isAccountOrTransaction, isHex } from "../../lib/strings";

export default function SearchBar() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const handleChange = (e) => {
    setInput(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = input.trim().replaceAll("_", "");

    if (trimmed.includes("-")) {
      router.push(`/principal/${trimmed}`);
    } else if (isAccountOrTransaction(trimmed)) {
      if (isAccount(trimmed)) {
        router.push(`/account/${trimmed}`);
      } else {
        router.push(`/transaction/${trimmed}`);
      }
    } else if (trimmed.match(/^\d+$/)) {
      router.push(`/neuron/${trimmed}`);
    } else if (isHex(trimmed)) {
      const principal = Principal.fromHex(trimmed).toText();
      router.push(`/principal/${principal}`);
    }
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1">
      <input
        type="text"
        name="search"
        className="flex-1 py-1 px-2 bg-gray-200 dark:bg-gray-800 rounded focus:border border-black dark:border-gray-200 focus:outline-none"
        placeholder="Search for principal, account, tx, neuron"
        value={input}
        onChange={handleChange}
      />
      <input type="submit" value="Submit" className="hidden" />
    </form>
  );
}
