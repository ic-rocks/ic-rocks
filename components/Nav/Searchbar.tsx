import { Principal } from "@dfinity/principal";
import { useRouter } from "next/router";
import { useState } from "react";
import { isAccount, isAccountOrTransaction, isHex } from "../../lib/strings";

export default function SearchBar() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const handleChange = (e) => {
    setInput(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (input.includes("-")) {
      router.push(`/principal/${input}`);
    } else if (isAccountOrTransaction(input)) {
      if (isAccount(input)) {
        router.push(`/account/${input}`);
      } else {
        router.push(`/transaction/${input}`);
      }
    } else if (input.match(/^\d+$/)) {
      router.push(`/neuron/${input}`);
    } else if (isHex(input)) {
      const principal = Principal.fromHex(input).toText();
      router.push(`/principal/${principal}`);
    }
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex">
      <input
        type="text"
        name="search"
        className="px-2 py-1 bg-gray-200 dark:bg-gray-800 focus:outline-none focus:border border-black dark:border-gray-200 rounded font-sm flex-1"
        placeholder="Search for principal, account, tx, neuron"
        value={input}
        onChange={handleChange}
      />
      <input type="submit" value="Submit" className="hidden" />
    </form>
  );
}
