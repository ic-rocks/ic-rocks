import { blobFromHex } from "@dfinity/agent";
import { getCrc32 } from "@dfinity/agent/lib/cjs/utils/getCrc";
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

    if (input.includes("-")) {
      router.push(`/principal/${input}`);
    } else {
      try {
        const blob = blobFromHex(input);
        const crc32Buf = Buffer.alloc(4);
        crc32Buf.writeUInt32BE(getCrc32(blob.slice(4)));
        const isAccount = blob.slice(0, 4).toString() === crc32Buf.toString();
        if (isAccount) {
          router.push(`/account/${input}`);
        } else {
          router.push(`/transaction/${input}`);
        }
      } catch (error) {
        router.push(`/account/${input}`);
      }
    }
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="mr-4">
      <input
        type="text"
        name="search"
        className="px-2 py-1 bg-gray-200 dark:bg-gray-800 focus:outline-none focus:border border-black dark:border-gray-200 rounded font-sm w-64"
        placeholder="Search for principal or account"
        value={input}
        onChange={handleChange}
      />
      <input type="submit" value="Submit" className="hidden" />
    </form>
  );
}
