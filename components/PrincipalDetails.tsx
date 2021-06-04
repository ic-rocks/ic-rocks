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
import { PrincipalType } from "../pages/principal/[principalId]";

export default function PrincipalDetails({
  className,
  principalId,
  canisterName,
  type,
  nodesType,
}: {
  className?: string;
  principalId: string;
  canisterName?: string;
  type: PrincipalType;
  nodesType?: string;
}) {
  if (typeof window === "undefined") {
    return null;
  }

  const [data, setData] = useState(null);
  const [subaccounts, setSubaccounts] = useState([]);
  const [showSubaccounts, setShowSubaccounts] = useState(false);

  useEffect(() => {
    setData(null);
    setShowSubaccounts(false);

    let principal;
    try {
      principal = Principal.fromText(principalId).toBlob();
    } catch (error) {
      return;
    }

    if (type == "Canister") {
      (async () => {
        const pathCommon = [blobFromText("canister"), principal];
        const pathModuleHash = pathCommon.concat(blobFromText("module_hash"));
        const pathController = pathCommon.concat(blobFromText("controller"));
        const agent = new HttpAgent({ host: "https://ic0.app" });
        try {
          const res = await agent.readState(principalId, {
            paths: [pathModuleHash, pathController],
          });
          const cert = new Certificate(res, agent);
          if (await cert.verify()) {
            const subnet = cert["cert"].delegation
              ? Principal.fromBlob(cert["cert"].delegation.subnet_id).toText()
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
  }, [type, principalId]);

  return (
    <div className={className}>
      <table className="w-full table-fixed">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr className="invisible">
            <td className="w-1/6" />
            <td className="w-5/6" />
          </tr>
          <tr>
            <th colSpan={2} className="px-2 py-2">
              Overview
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
          <tr>
            <td className="px-2 py-2 w-1/6">Name</td>
            <td className="px-2 py-2 w-5/6">
              {canisterName ? canisterName : "Unknown"}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Type</td>
            <td className="px-2 py-2 w-5/6">
              {type}
              {nodesType
                ? nodesType === "operator"
                  ? " (Node Operator)"
                  : " (Node Provider)"
                : null}
            </td>
          </tr>
          {type == "Canister" && (
            <>
              <tr>
                <td className="px-2 py-2 w-1/6">Subnet</td>
                <td className="px-2 py-2 w-5/6 overflow-hidden overflow-ellipsis">
                  {data?.subnet ? (
                    <Link href={`/subnet/${data?.subnet}`}>
                      <a className="hover:underline text-blue-600">
                        {data?.subnet}
                      </a>
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-2 w-1/6">Module Hash</td>
                <td className="px-2 py-2 w-5/6 overflow-hidden overflow-ellipsis">
                  {data?.moduleHash || "-"}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-2 w-1/6">Controller</td>
                <td className="px-2 py-2 w-5/6 overflow-hidden overflow-ellipsis">
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
            <td className="px-2 py-2 w-1/6 align-top">Accounts</td>
            <td className="px-2 py-2 w-5/6 overflow-hidden overflow-ellipsis">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
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
        </tbody>
      </table>
    </div>
  );
}
