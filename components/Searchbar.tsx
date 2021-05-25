import { useRouter } from "next/router";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const handleChange = (e) => {
    setInput(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/canister/${input}`);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="mr-4">
      <input
        type="text"
        name="search"
        className="px-2 py-1 bg-gray-200 dark:bg-gray-800 focus:outline-none focus:border border-black dark:border-gray-200 rounded font-sm w-64"
        placeholder="Search for canister..."
        value={input}
        onChange={handleChange}
      />
      <input type="submit" value="Submit" className="hidden" />
    </form>
  );
}
