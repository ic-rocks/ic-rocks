import { Actor, HttpAgent } from "@dfinity/agent";
import { getCrc32 } from "@dfinity/principal/lib/cjs/utils/getCrc";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import BalanceLabel from "../../components/Labels/BalanceLabel";
import { MetaTags } from "../../components/MetaTags";
import Search404 from "../../components/Search404";
import { useGlobalState } from "../../components/StateContext";
import { TransactionsTable } from "../../components/TransactionsTable";
import ledgerIdl from "../../lib/canisters/ledger.did";
import fetchJSON from "../../lib/fetch";
import { formatNumber, formatNumberUSD } from "../../lib/numbers";
import { Account } from "../../lib/types/API";

const agent = new HttpAgent({ host: "https://ic0.app" });
const ledger = Actor.createActor(ledgerIdl, {
  agent,
  canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
});

const AccountPage = () => {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const { accountId } = router.query as { accountId: string };
  const { markets } = useGlobalState();

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
        const data: Account = await fetchJSON(`/api/accounts/${accountId}`);
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
    <div className="pb-16">
      <MetaTags
        title={`Account${accountId ? ` ${accountId}` : ""}`}
        description={`Details for account${
          accountId ? ` ${accountId}` : ""
        } on the Internet Computer ledger.`}
      />
      <h1 className="text-3xl my-8 overflow-hidden overflow-ellipsis">
        Account <small className="text-xl break-all">{accountId}</small>
      </h1>
      <table className="w-full table-fixed">
        <thead className="bg-heading">
          <tr className="flex">
            <th colSpan={2} className="px-2 py-2">
              Account Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-default">
          <tr className="flex">
            <td className="px-2 py-2 w-32">Name</td>
            <td className="px-2 py-2 flex-1">
              {data?.name || (
                <span className="inline-flex items-center">Unknown</span>
              )}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-32">Principal</td>
            <td className="px-2 py-2 flex-1 flex oneline">
              {data?.principal ? (
                <Link href={`/principal/${data.principal}`}>
                  <a className="link-overflow">{data.principal}</a>
                </Link>
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-32">Balance</td>
            <td className="px-2 py-2 flex-1">
              {data ? <BalanceLabel value={data.balance} /> : "-"}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-32">Value</td>
            <td className="px-2 py-2 flex-1">
              {data && markets?.ticker ? (
                <>
                  {formatNumberUSD(
                    (Number(markets.ticker.price) * Number(data.balance)) / 1e8
                  )}
                  <small className="ml-1 text-xs">
                    (@{formatNumberUSD(markets.ticker.price)}/ICP)
                  </small>
                </>
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-32">Transactions</td>
            <td className="px-2 py-2 flex-1">
              {data?.tx_count ? formatNumber(data.tx_count) : 0}
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

export default AccountPage;
