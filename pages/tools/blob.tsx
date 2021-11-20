import * as cbor from "@dfinity/agent/lib/cjs/cbor";
import { Principal } from "@dfinity/principal";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ActiveLink from "../../components/ActiveLink";
import {
  CandidOutputDisplay,
  CANDID_OUTPUT_DISPLAYS,
} from "../../components/CanisterUI/CandidElements";
import {
  Output,
  OutputDisplayButtons,
} from "../../components/CanisterUI/Shared";
import IdentifierLink from "../../components/Labels/IdentifierLink";
import { MetaTags } from "../../components/MetaTags";
import { SecondaryNav } from "../../components/Nav/SecondaryNav";
import { decodeBlob, stringify } from "../../lib/candid/utils";
import { getIdentityKind, IdentityKind, isHex } from "../../lib/strings";

export default function BlobDebugger() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [asPrincipal, setAsPrincipal] = useState("");
  const [asHex, setAsHex] = useState("");
  const [asCbor, setAsCbor] = useState("");
  const [asCandid, setAsCandid] = useState(null);
  const [candidOutput, setCandidOutput] = useState<CandidOutputDisplay>(
    CANDID_OUTPUT_DISPLAYS[0]
  );
  const [outputType, setOutputType] = useState(IdentityKind.None);
  useEffect(() => {
    setAsPrincipal("");
    setAsHex("");
    setOutput("");
    setAsCbor("");
    setAsCandid(null);
    setOutputType(IdentityKind.None);

    if (!input) {
      return;
    }

    const trimmed = input.trim();
    const [kind, value] = getIdentityKind(trimmed);
    setOutputType(kind);
    if (kind === IdentityKind.Candid) {
      try {
        const candid = decodeBlob(Buffer.from(value as string, "hex"));
        setAsCandid(candid);
      } catch (error) {
        console.warn(error.message);
      }
    } else if (kind === IdentityKind.Wasm) {
      // not supported yet
    } else {
      if (value instanceof Principal) {
        setAsPrincipal(value.toText());
        setAsHex(value.toHex().toLowerCase());
      } else {
        if (isHex(value)) {
          if (value.length <= 58) {
            const principal = Principal.fromHex(value);
            setAsPrincipal(principal.toText());
          }
          setAsHex(value.toLowerCase());
          setOutput(value);
        } else {
          setAsHex(Buffer.from(trimmed).toString("hex"));
          setOutput(value);
        }
      }

      // Try cbor
      if (isHex(trimmed)) {
        try {
          const decoded = cbor.decode(Buffer.from(trimmed, "hex"));
          if (decoded) {
            setAsCbor(stringify(decoded));
          }
        } catch (error) {
          console.warn(error.message);
        }
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
        items={[
          <ActiveLink key="1" href="/tools/blob">
            Blob Debugger
          </ActiveLink>,
        ]}
      />
      <h1 className="my-8 text-3xl">Blob Debugger</h1>
      <p>Paste any hex or base64 to debug.</p>
      <div className="flex gap-2 my-2 text-xs">
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
        <a
          className="cursor-pointer link-overflow"
          onClick={() =>
            setInput(
              "d9d9f7a266737461747573677265706c696564657265706c79a1636172674908ef81c184dccb801b"
            )
          }
        >
          CBOR
        </a>
      </div>
      <textarea
        className="p-4 w-full font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded"
        style={{ minHeight: 250 }}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter any hex blob to debug it"
        value={input}
      />
      <div className="flex gap-8 items-baseline my-4">
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
          <IdentifierLink type="account" id={output} />
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
          <IdentifierLink type="principal" id={asPrincipal} />
        </div>
      )}
      {!!asHex && (
        <div className="my-4">
          <p>As Hex</p>
          <textarea
            readOnly
            className="p-4 w-full font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded"
            value={asHex}
          />
        </div>
      )}
      {!!asCbor && (
        <div className="my-4">
          <p>As CBOR</p>
          <textarea
            readOnly
            className="p-4 w-full font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded"
            style={{ minHeight: asCbor.split("\n").length * 20 }}
            value={asCbor}
          />
        </div>
      )}
      {!!asCandid && (
        <div className="my-4">
          <p>As Candid</p>
          <OutputDisplayButtons
            format="candid"
            value={candidOutput}
            onClick={(value) => setCandidOutput(value)}
          />
          {asCandid.types.map((type, i) => (
            <Output
              key={i}
              format="candid"
              display={candidOutput}
              type={type}
              value={{ res: asCandid.outputs[i] }}
            />
          ))}
        </div>
      )}
      {outputType === IdentityKind.None && !asCbor && (
        <textarea
          readOnly
          className="p-4 w-full font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded"
          placeholder="Results will appear here..."
          value={output}
        />
      )}
    </div>
  );
}
