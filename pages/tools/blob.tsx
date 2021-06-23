import { Principal } from "@dfinity/principal";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ActiveLink from "../../components/ActiveLink";
import { MetaTags } from "../../components/MetaTags";
import { SecondaryNav } from "../../components/Nav/SecondaryNav";
import { decodeBlob, stringify } from "../../lib/candid/utils";
import { getIdentityKind, IdentityKind, isHex } from "../../lib/strings";

export default function BlobDebugger() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [asPrincipal, setAsPrincipal] = useState("");
  const [asHex, setAsHex] = useState("");
  const [outputType, setOutputType] = useState(IdentityKind.None);
  useEffect(() => {
    if (!input) {
      setAsPrincipal("");
      setAsHex("");
      setOutput("");
      setOutputType(IdentityKind.None);
      return;
    }

    const trimmed = input.trim();
    const [kind, value] = getIdentityKind(trimmed);
    setOutputType(kind);
    if (kind === IdentityKind.Candid) {
      setAsPrincipal("");
      setAsHex("");
      try {
        const { types, output } = decodeBlob(
          Buffer.from(value as string, "hex")
        );
        setOutput(stringify(output));
      } catch (error) {
        console.warn(error.message);
      }
    } else if (value instanceof Principal) {
      setAsPrincipal(value.toText());
      setAsHex(value.toHex().toLowerCase());
      setOutput("");
    } else {
      if (isHex(trimmed)) {
        const principal = Principal.fromHex(trimmed);
        setAsPrincipal(principal.toText());
        setAsHex(principal.toHex().toLowerCase());
        setOutput(value);
      } else {
        setAsPrincipal("");
        setAsHex(Buffer.from(input).toString("hex"));
        setOutput(value);
      }
    }
  }, [input]);
  return (
    <div className="pb-16">
      <MetaTags
        title="Blob Debugger"
        description="Debug arbitrary binary data"
      />
      <SecondaryNav
        items={[<ActiveLink href="/tools/blob">Blob Debugger</ActiveLink>]}
      />
      <h1 className="text-3xl my-8">Blob Debugger</h1>
      <p>Paste any hex or base64 to debug.</p>
      <div className="my-2 flex text-xs gap-2">
        <label>Examples:</label>
        <a
          className="cursor-pointer link-overflow"
          onClick={() => setInput("00000000000000000101")}
        >
          Principal (hex)
        </a>
        <a
          className="cursor-pointer link-overflow"
          onClick={() => setInput("z/KA4y1/XM0iRogvlK+yD1TKYaIXZecS1D0niQI=")}
        >
          Principal (base64)
        </a>
        <a
          className="cursor-pointer link-overflow"
          onClick={() =>
            setInput(
              "125013e95bd5e008bd6d26f86f5ddda2b16c382372b3067672505c1f11418817"
            )
          }
        >
          Account
        </a>
        <a
          className="cursor-pointer link-overflow"
          onClick={() =>
            setInput(
              "9e32c54975adf84a1d98f19df41bbc34a752a899c32cc9c0000200b2c4308f85"
            )
          }
        >
          Transaction
        </a>
        <a
          className="cursor-pointer link-overflow"
          onClick={() =>
            setInput("4449444c016b0180017502007100deadbeef0869632e726f636b73")
          }
        >
          Candid
        </a>
      </div>
      <textarea
        className="w-full p-4 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono"
        style={{ minHeight: 250 }}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter any hex blob to debug it"
        value={input}
      />
      <div className="my-4 flex gap-8 items-baseline">
        <h3 className="text-xl">Output</h3>
        <label>
          {!!input &&
            (outputType !== IdentityKind.None
              ? `Looks like ${IdentityKind[outputType]}`
              : "Unknown type")}
        </label>
      </div>
      {outputType === IdentityKind.AccountIdentifier && (
        <div className="my-4">
          <p>{IdentityKind[outputType]}</p>
          <Link href={`/account/${output}`}>
            <a className="link-overflow">{output}</a>
          </Link>
        </div>
      )}
      {outputType === IdentityKind.Transaction && (
        <div className="my-4">
          <p>{IdentityKind[outputType]}</p>
          <Link href={`/transaction/${output}`}>
            <a className="link-overflow">{output}</a>
          </Link>
        </div>
      )}
      {!!asPrincipal && (
        <div className="my-4">
          <p>As Principal</p>
          <Link href={`/principal/${asPrincipal}`}>
            <a className="link-overflow">{asPrincipal}</a>
          </Link>
        </div>
      )}
      {!!asHex && (
        <div className="my-4">
          <p>As Hex</p>
          <textarea
            readOnly
            className="w-full p-4 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono"
            value={asHex}
          />
        </div>
      )}
      {(outputType === IdentityKind.Candid ||
        outputType === IdentityKind.None) && (
        <textarea
          readOnly
          className="w-full p-4 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono"
          placeholder="Results will appear here..."
          style={{ minHeight: outputType === IdentityKind.Candid ? 300 : 100 }}
          value={output}
        />
      )}
    </div>
  );
}
