import {
  blobFromBuffer,
  blobFromText,
  Certificate,
  HttpAgent,
  Principal,
} from "@dfinity/agent";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const CANDID_UI_URL = "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/";

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

  useEffect(() => {
    if (!canisterId) return;
    console.log("uef", canisterId);
    setData(null);

    (async () => {
      const pathCommon = [
        blobFromText("canister"),
        Principal.fromText(canisterId).toBlob(),
      ];
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
              className="border border-gray-400 dark:border-gray-600 px-2"
            >
              Canister Details
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 dark:border-gray-600 px-2 w-1/4">
              Name
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 font-mono text-sm w-3/4">
              {canisterName ? canisterName : "Unknown"}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 dark:border-gray-600 px-2 w-1/4">
              Subnet
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 font-mono text-sm w-3/4">
              {data?.subnet || "-"}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 dark:border-gray-600 px-2 w-1/4">
              Module Hash
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 font-mono text-sm w-3/4">
              {data?.moduleHash || "-"}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 dark:border-gray-600 px-2 w-1/4">
              Controller
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 font-mono text-sm w-3/4">
              {data?.controller ? (
                <Link href={`/canister/${data?.controller}`}>
                  <a className="hover:underline text-blue-600">
                    {data?.controller}
                  </a>
                </Link>
              ) : (
                "-"
              )}
            </td>
          </tr>
          {candidEncoded && (
            <tr>
              <td
                colSpan={2}
                className="border border-gray-400 dark:border-gray-600 px-2 py-1 text-sm text-sm"
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
