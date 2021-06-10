import { Actor, HttpAgent } from "@dfinity/agent";
import { getCrc32 } from "@dfinity/principal/lib/cjs/utils/getCrc";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { MetaTitle } from "../../components/MetaTags";
import Search404 from "../../components/Search404";
import { TransactionsTable } from "../../components/TransactionsTable";
import ledgerIdl from "../../lib/canisters/ledger.did";
import fetchJSON from "../../lib/fetch";
import { formatNumber } from "../../lib/numbers";

const agent = new HttpAgent({ host: "https://ic0.app" });
const ledger = Actor.createActor(ledgerIdl, {
  agent,
  canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
});

const Account = () => {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const { accountId } = router.query as { accountId: string };

  useEffect(() => {
    if (typeof accountId !== "string" || !accountId) return;

    setData(null);

    let valid = false;
    try {
      const blob = Buffer.from(accountId, "hex");
      const crc32Buf = Buffer.alloc(4);
      crc32Buf.writeUInt32BE(getCrc32(blob.slice(4)));
      valid = blob.slice(0, 4).toString() === crc32Buf.toString();
    } catch (error) {
      console.warn(error);
    }
    setIsValid(valid);

    if (valid) {
      (async () => {
        const data = await fetchJSON(`/api/accounts/${accountId}`);
        if (data) {
          setData(data);
        }

        const res = (await ledger.account_balance_dfx({
          account: accountId,
        })) as { es8: BigInt };
        const ledgerBal = res["e8s"].toString();
        if (data) {
          if (ledgerBal !== data.balance) {
            console.warn(`balance: ledger=${ledgerBal} api=${data.balance}`);
          }
        } else {
          setData({
            balance: ledgerBal,
          });
        }
      })();
    }
  }, [accountId]);

  return isValid ? (
    <div className="py-16">
      <MetaTitle title={`Account${accountId ? ` ${accountId}` : ""}`} />
      <h1 className="text-3xl mb-8 overflow-hidden overflow-ellipsis">
        Account <small className="text-2xl">{accountId}</small>
      </h1>
      <table className="w-full table-fixed">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr className="invisible">
            <td className="w-1/4" />
            <td className="w-3/4" />
          </tr>
          <tr>
            <th colSpan={2} className="px-2 py-2">
              Account Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
          <tr>
            <td className="px-2 py-2 w-1/4">Principal</td>
            <td className="px-2 py-2 w-3/4 overflow-hidden overflow-ellipsis">
              {data?.principal ? (
                <Link href={`/principal/${data.principal}`}>
                  <a className="hover:underline text-blue-600">
                    {data.principal}
                  </a>
                </Link>
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Balance</td>
            <td className="px-2 py-2 w-3/4">
              {data ? (
                <>
                  {formatNumber(Number(data.balance) / 1e8)}{" "}
                  <span className="text-xs">ICP</span>
                </>
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Transactions</td>
            <td className="px-2 py-2 w-3/4">
              {data?.tx_count ? formatNumber(data.tx_count) : 0}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/4">Name</td>
            <td className="px-2 py-2 w-3/4">
              {data?.name || (
                <span className="inline-flex items-center">Unknown</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <section className="pt-8">
        <TransactionsTable key={accountId} accountId={accountId} />
      </section>
    </div>
  ) : (
    <Search404 input={accountId} />
  );
};

export default Account;
