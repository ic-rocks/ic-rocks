import {
  blobFromBuffer,
  blobFromText,
  Certificate,
  HttpAgent,
  Principal,
} from "@dfinity/agent";
import { getCrc32 } from "@dfinity/agent/lib/cjs/utils/getCrc.js";
import { sha224 } from "@dfinity/agent/lib/cjs/utils/sha224.js";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const CANDID_UI_URL = "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/";

type Type = "Canister" | "User" | "Anonymous" | "Derived";

export default function CanisterDetails({
  className,
  canisterId,
  candid,
  canisterName,
}: {
  className?: string;
  canisterId: string;
  candid?: string;
  canisterName?: string;
}) {
  const [data, setData] = useState(null);
  const [type, setType] = useState<Type>("Canister");
  const [subaccounts, setSubaccounts] = useState([]);
  const [showSubaccounts, setShowSubaccounts] = useState(false);

  useEffect(() => {
    setData(null);
    setShowSubaccounts(false);

    let principal;
    try {
      principal = Principal.fromText(canisterId).toBlob();
    } catch (error) {
      return;
    }

    let type_ = "Canister";
    switch (principal.slice(-1)[0]) {
      case 1:
        type_ = "Canister";
        break;
      case 2:
        type_ = "User";
        break;
      case 3:
        type_ = "Derived";
        break;
      case 4:
        type_ = "Anonymous";
        break;
    }
    setType(type_ as Type);

    if (type_ == "Canister") {
      (async () => {
        const pathCommon = [blobFromText("canister"), principal];
        const pathModuleHash = pathCommon.concat(blobFromText("module_hash"));
        const pathController = pathCommon.concat(blobFromText("controller"));
        const agent = new HttpAgent({ host: "https://ic0.app" });
        try {
          const res = await agent.readState(canisterId, {
            paths: [pathModuleHash, pathController],
          });
          const cert = new Certificate(res, agent);
          if (await cert.verify()) {
            const subnet = cert["cert"].delegation
              ? cert["cert"].delegation.subnet_id.toString("hex")
              : null;
            const moduleHash = cert.lookup(pathModuleHash).toString("hex");
            const controller = Principal.fromBlob(
              blobFromBuffer(cert.lookup(pathController))
            ).toText();
            setData({ subnet, moduleHash, controller });
          }
        } catch (error) {
          console.warn(error);
          return;
        }
      })();
    }

    setSubaccounts(
      Array.from({ length: 10 }).map((_, i) => {
        const subaccount = Buffer.alloc(32);
        subaccount[31] = i;
        const aId = sha224(
          Buffer.concat([Buffer.from("\x0Aaccount-id"), principal, subaccount])
        );
        const crc32Buf = Buffer.alloc(4);
        crc32Buf.writeUInt32BE(getCrc32(aId));
        return Buffer.concat([crc32Buf, aId]).toString("hex");
      })
    );
  }, [canisterId]);

  if (typeof window === "undefined") {
    return null;
  }

  const candidEncoded = candid ? encodeURIComponent(window.btoa(candid)) : null;

  return (
    <div className={className}>
      <table className="w-full border-collapse border border-gray-800">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th
              colSpan={2}
              className="border border-gray-400 dark:border-gray-600 px-2 py-2"
            >
              Overview
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 dark:border-gray-600 px-2 w-1/6">
              Name
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 font-mono text-sm w-5/6">
              {canisterName ? canisterName : "Unknown"}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 dark:border-gray-600 px-2 w-1/6">
              Type
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 font-mono text-sm w-5/6">
              {type}
            </td>
          </tr>
          {type == "Canister" && (
            <>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 px-2 w-1/6">
                  Subnet
                </td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 font-mono text-sm w-5/6">
                  {data?.subnet || "-"}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 px-2 w-1/6">
                  Module Hash
                </td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 font-mono text-sm w-5/6">
                  {data?.moduleHash || "-"}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 px-2 w-1/6">
                  Controller
                </td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 font-mono text-sm w-5/6">
                  {data?.controller ? (
                    <Link href={`/principal/${data?.controller}`}>
                      <a className="hover:underline text-blue-600">
                        {data?.controller}
                      </a>
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            </>
          )}
          <tr>
            <td className="border border-gray-400 dark:border-gray-600 px-2 w-1/6 align-top">
              Accounts
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 text-sm w-5/6">
              <div className="divide-y divide-gray-200 dark:divide-gray-800 font-mono">
                {subaccounts
                  .slice(0, showSubaccounts ? 10 : 1)
                  .map((subaccount, index) => {
                    return (
                      <div key={subaccount} className="flex justify-between">
                        <Link href={`/account/${subaccount}`}>
                          <a className="hover:underline text-blue-600">
                            {subaccount}
                          </a>
                        </Link>
                        {showSubaccounts && (
                          <span className="w-8 px-2 text-right text-gray-400 dark:text-gray-600">
                            {index}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
              <span
                className="text-xs text-gray-400 cursor-pointer hover:underline"
                onClick={() => setShowSubaccounts(!showSubaccounts)}
              >
                {showSubaccounts ? "Hide" : "Show more"}
              </span>
            </td>
          </tr>
          {candidEncoded && (
            <tr>
              <td
                colSpan={2}
                className="border border-gray-400 dark:border-gray-600 px-2 py-1 text-sm"
              >
                <a
                  className="hover:underline text-blue-600"
                  href={`${CANDID_UI_URL}?id=${canisterId}&did=${candidEncoded}`}
                  target="_blank"
                >
                  Go to Candid UI
                </a>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
