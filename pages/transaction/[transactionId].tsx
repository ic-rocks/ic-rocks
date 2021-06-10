import { Actor, HttpAgent } from "@dfinity/agent";
import classnames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { MetaTitle } from "../../components/MetaTags";
import Search404 from "../../components/Search404";
import { TimestampLabel } from "../../components/TimestampLabel";
import { TransactionTypeLabel } from "../../components/TransactionTypeLabel";
import ledgerIdl from "../../lib/canisters/ledger.did";
import fetchJSON from "../../lib/fetch";
import { formatNumber } from "../../lib/numbers";
import { Transaction, TransactionsResponse } from "../../lib/types/API";

const agent = new HttpAgent({ host: "https://ic0.app" });
const ledger = Actor.createActor(ledgerIdl, {
  agent,
  canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
});

const TransactionPage = () => {
  const router = useRouter();
  const [data, setData] = useState<Transaction>(null);
  const [isValid, setIsValid] = useState(true);
  const [isLoadingTxs, setIsLoadingTxs] = useState(false);
  const { transactionId } = router.query as { transactionId: string };

  useEffect(() => {
    if (typeof transactionId !== "string" || !transactionId) return;

    setData(null);
    setIsLoadingTxs(true);
    setIsValid(true);

    fetchJSON(`/api/transactions/${transactionId}`)
      .then((data: TransactionsResponse) => {
        const tx = data.rows[0];
        if (!tx) throw "tx not found";
        setData(tx);
        setIsLoadingTxs(false);
      })
      .catch((err) => {
        console.warn(err);
        setIsValid(false);
      });
  }, [transactionId]);

  return isValid ? (
    <div className="py-16">
      <MetaTitle
        title={`Transaction${transactionId ? ` ${transactionId}` : ""}`}
      />
      <h1 className="text-3xl mb-8">Transaction Details</h1>
      <table className="table-fixed w-full">
        <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
          <tr>
            <td className="px-2 py-2 w-1/6">Hash</td>
            <td className="px-2 py-2 w-5/6 overflow-hidden overflow-ellipsis">
              {data ? data.id : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Block</td>
            <td className="px-2 py-2 w-5/6">
              {data ? data.blockHeight : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Type</td>
            <td className="px-2 py-2 w-5/6">
              {data ? <TransactionTypeLabel type={data.type} /> : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Amount</td>
            <td className="px-2 py-2 w-5/6">
              {data != null ? (
                <>
                  {formatNumber(Math.abs(Number(data.amount)) / 1e8)}{" "}
                  <span className="text-xs">ICP</span>
                </>
              ) : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Timestamp</td>
            <td className="px-2 py-2 w-5/6">
              {data ? (
                <TimestampLabel dt={DateTime.fromISO(data.createdDate)} />
              ) : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">From</td>
            <td
              className={classnames("px-2 py-2 w-5/6 overflow-hidden flex", {})}
            >
              {data ? (
                data.type === "MINT" ? (
                  "Mint"
                ) : (
                  <Link href={`/account/${data.senderId}`}>
                    <a className="link-overflow">
                      {data.sender?.name || data.senderId}
                    </a>
                  </Link>
                )
              ) : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">To</td>
            <td
              className={classnames("px-2 py-2 w-5/6 overflow-hidden flex", {})}
            >
              {data ? (
                data.type === "BURN" ? (
                  "Burn"
                ) : (
                  <Link href={`/account/${data.receiverId}`}>
                    <a className="link-overflow">
                      {data.receiver?.name || data.receiverId}
                    </a>
                  </Link>
                )
              ) : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Fee</td>
            <td className="px-2 py-2 w-5/6">
              {data ? (
                data.fee ? (
                  <>
                    {formatNumber(Math.abs(Number(data.fee)) / 1e8)}{" "}
                    <span className="text-xs">ICP</span>
                  </>
                ) : (
                  0
                )
              ) : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Memo</td>
            <td className="px-2 py-2 w-5/6">{data ? data.memo : null}</td>
          </tr>
        </tbody>
      </table>
    </div>
  ) : (
    <Search404 input={transactionId} />
  );
};

export default TransactionPage;
