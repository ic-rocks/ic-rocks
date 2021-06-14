import { Principal } from "@dfinity/principal";
import { getCrc32 } from "@dfinity/principal/lib/cjs/utils/getCrc.js";
import { sha224 } from "@dfinity/principal/lib/cjs/utils/sha224.js";
import { Buffer } from "buffer/";
import classNames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { APIPrincipal, Canister } from "../lib/types/API";
import { PrincipalType } from "../pages/principal/[principalId]";
import BalanceLabel from "./Labels/BalanceLabel";
import { TimestampLabel } from "./Labels/TimestampLabel";

export default function PrincipalDetails({
  className,
  principalId,
  type,
  principalData,
  canisterData,
}: {
  className?: string;
  principalId: string;
  canisterName?: string;
  type: PrincipalType;
  principalData?: APIPrincipal;
  canisterData?: Canister;
}) {
  if (typeof window === "undefined") {
    return null;
  }

  const [generatedAccounts, setGeneratedAccounts] = useState([]);

  useEffect(() => {
    let principal;
    try {
      principal = Buffer.from(Principal.fromText(principalId).toUint8Array());
    } catch (error) {
      return;
    }

    setGeneratedAccounts(
      Array.from({ length: 1 }).map((_, i) => {
        const subaccount = Buffer.alloc(32);
        subaccount[31] = i;
        const aId = Buffer.from(
          sha224(
            Buffer.concat([
              Buffer.from("\x0Aaccount-id"),
              principal,
              subaccount,
            ])
          )
        );
        const crc32Buf = Buffer.alloc(4);
        crc32Buf.writeUInt32BE(getCrc32(aId), 0);
        return { id: Buffer.concat([crc32Buf, aId]).toString("hex") };
      })
    );
  }, [principalId]);

  const [httpResponse, setHttpResponse] = useState<Response>(null);
  useEffect(() => {
    if (canisterData?.module?.hasHttp) {
      (async () => {
        const res = await fetch(`https://${principalId}.raw.ic0.app`);
        setHttpResponse(res);
      })();
    }
  }, [canisterData]);

  const accounts =
    principalData?.accounts && principalData.accounts.length > 0
      ? principalData.accounts
      : generatedAccounts;

  return (
    <div className={className}>
      <table className="w-full table-fixed">
        <thead className="block bg-heading">
          <tr className="flex">
            <th
              colSpan={2}
              className="px-2 py-2 flex-1 flex flex-wrap justify-between"
            >
              Overview
              {canisterData?.module?.hasHttp && (
                <div>
                  {httpResponse && !httpResponse.ok && (
                    <span
                      className={classNames("font-normal text-xs mr-1", {
                        "text-yellow-400":
                          httpResponse.status >= 300 &&
                          httpResponse.status < 400,
                        "text-red-400": httpResponse.status >= 400,
                      })}
                    >
                      {httpResponse.status}{" "}
                      {httpResponse.status === 404
                        ? "Not Found"
                        : httpResponse.statusText}
                    </span>
                  )}
                  <a
                    className="hover:underline font-normal label-tag bg-green-label"
                    href={`https://${principalId}.raw.ic0.app`}
                    target="_blank"
                  >
                    View URL <FiExternalLink className="inline ml-1" />
                  </a>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody className="block divide-y divide-gray-300 dark:divide-gray-700">
          <tr className="flex">
            <td className="px-2 py-2 w-24 sm:w-44">Name</td>
            <td className="px-2 py-2 flex-1">
              {principalData?.name ? principalData.name : "Unknown"}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-24 sm:w-44">Type</td>
            <td className="px-2 py-2 flex-1">
              {type}
              {type == "Canister" &&
                canisterData &&
                ` (${canisterData.status === "Stopped" ? "🛑 " : ""}${
                  canisterData.status
                })`}
              {principalData?.operatorOf.length > 0
                ? " (Node Operator)"
                : principalData?.providerOf.length > 0
                ? " (Node Provider)"
                : null}
            </td>
          </tr>
          {type == "Canister" && (
            <>
              <tr className="flex">
                <td className="px-2 py-2 w-24 sm:w-44">Subnet</td>
                <td className="px-2 py-2 flex-1 overflow-hidden">
                  {canisterData?.subnetId ? (
                    <Link href={`/subnet/${canisterData.subnetId}`}>
                      <a className="link-overflow">
                        {canisterData.subnet?.displayName}
                      </a>
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr className="flex">
                <td className="px-2 py-2 w-24 sm:w-44">Created</td>
                <td className="px-2 py-2 flex-1">
                  {canisterData?.createdDate ? (
                    <TimestampLabel
                      dt={DateTime.fromISO(canisterData.createdDate)}
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr className="flex">
                <td className="px-2 py-2 w-24 sm:w-44">Last Updated</td>
                <td className="px-2 py-2 flex-1">
                  {canisterData?.latestVersionDate ? (
                    <TimestampLabel
                      dt={DateTime.fromISO(canisterData.latestVersionDate)}
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr className="flex">
                <td className="px-2 py-2 w-24 sm:w-44">Versions</td>
                <td className="px-2 py-2 flex-1">
                  {canisterData?.versions ? canisterData.versions.length : "-"}
                </td>
              </tr>
              <tr className="flex">
                <td className="px-2 py-2 w-24 sm:w-44">Module Hash</td>
                <td className="px-2 py-2 flex-1 break-words overflow-hidden">
                  {canisterData?.module ? (
                    <>
                      {canisterData.module.name && (
                        <div>{canisterData.module.name}</div>
                      )}
                      <div>{canisterData.module?.id || "-"}</div>
                      {canisterData.module.canisterCount > 1 && (
                        <Link href={`/modules/${canisterData.module.id}`}>
                          <a className="text-sm link-overflow">
                            {canisterData.module.canisterCount} matching modules
                          </a>
                        </Link>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr className="flex">
                <td className="px-2 py-2 w-24 sm:w-44">Controller</td>
                <td className="px-2 py-2 flex-1">
                  {canisterData?.controllerId ? (
                    <Link href={`/principal/${canisterData.controllerId}`}>
                      <a className="link-overflow">
                        {canisterData?.controller?.name ||
                          canisterData?.controllerId}
                      </a>
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            </>
          )}
          <tr className="flex">
            <td className="px-2 py-2 w-24 sm:w-44">Controlled Canisters</td>
            <td className="px-2 py-2 flex-1">
              {principalData?.canisterCount ? principalData.canisterCount : "-"}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-24 sm:w-44 align-top">
              Ledger Accounts
            </td>
            <td className="px-2 py-2 flex-1 overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {accounts.map(({ id, balance }) => {
                  return (
                    <div key={id} className="flex justify-between">
                      <Link href={`/account/${id}`}>
                        <a className="link-overflow flex-1">{id}</a>
                      </Link>
                      {balance && (
                        <span className="w-32 text-right text-gray-400 dark:text-gray-600">
                          <BalanceLabel value={balance} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
