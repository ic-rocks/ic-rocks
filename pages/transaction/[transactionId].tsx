import { Actor, HttpAgent } from "@dfinity/agent";
import classnames from "classnames";
import { DateTime } from "luxon";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Search404 from "../../components/Search404";
import { TransactionTypeLabel } from "../../components/TransactionTypeLabel";
import ledgerIdl from "../../lib/canisters/ledger.did";
import { TITLE_SUFFIX } from "../../lib/constants";
import { formatNumber } from "../../lib/numbers";
import { TransactionResult } from "../../lib/types/TransactionResult";

const agent = new HttpAgent({ host: "https://ic0.app" });
const ledger = Actor.createActor(ledgerIdl, {
  agent,
  canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
});

const Transaction = () => {
  const router = useRouter();
  const [tx, setTx] = useState(null);
  const [accounts, setAccounts] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isLoadingTxs, setIsLoadingTxs] = useState(false);
  const { transactionId } = router.query as { transactionId: string };

  useEffect(() => {
    if (typeof transactionId !== "string" || !transactionId) return;

    setTx(null);
    setIsLoadingTxs(true);
    setIsValid(true);

    fetch("https://rosetta-api.internetcomputer.org/search/transactions", {
      body: JSON.stringify({
        network_identifier: {
          blockchain: "Internet Computer",
          network: "00000000000000020101",
        },
        transaction_identifier: {
          hash: transactionId,
        },
      }),
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    })
      .then((res) => res.json())
      .then((json: TransactionResult) => {
        const tx0 = json.transactions[0];
        const type = tx0.transaction.operations[0].type;
        let from, to, amount, fee;
        if (type === "TRANSACTION") {
          let fromOp = tx0.transaction.operations.find(
            (op) => op.type === "TRANSACTION" && op.amount.value.startsWith("-")
          );
          let toOp = tx0.transaction.operations.find(
            (op) =>
              op.type === "TRANSACTION" && !op.amount.value.startsWith("-")
          );
          if (!fromOp) {
            fromOp = tx0.transaction.operations[0];
            toOp = tx0.transaction.operations[1];
          }
          from = fromOp.account.address;
          const feeOp = tx0.transaction.operations.find(
            (op) => op.type === "FEE"
          );
          to = toOp.account.address;
          amount = toOp.amount;
          fee = feeOp.amount;
        } else if (type === "MINT") {
          from = type;
          to = tx0.transaction.operations[0].account.address;
          amount = tx0.transaction.operations[0].amount;
        } else if (type === "BURN") {
          from = tx0.transaction.operations[0].account.address;
          to = type;
          amount = tx0.transaction.operations[0].amount;
        }

        const formatted = {
          ...tx0.transaction.metadata,
          type,
          block_hash: tx0.block_identifier.hash,
          tx_hash: tx0.transaction.transaction_identifier.hash,
          from,
          to,
          amount,
          fee,
        };
        setTx(formatted);
        setIsLoadingTxs(false);
      })
      .catch((err) => {
        console.warn(err);
        setIsValid(false);
      });
  }, [transactionId]);

  useEffect(() => {
    fetch("/data/accounts.json")
      .then((res) => res.json())
      .then((json) => {
        setAccounts(json);
      });
  }, []);

  const title = `Transaction ${transactionId}`;
  const date = tx ? DateTime.fromMillis(tx.timestamp / 1e6).toUTC() : null;

  return isValid ? (
    <div className="py-16">
      <Head>
        <title>
          {title} {TITLE_SUFFIX}
        </title>
      </Head>
      <h1 className="text-3xl mb-8">Transaction Details</h1>
      <table className="w-full">
        {/* <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th colSpan={2} className="px-2 py-2">
              Transaction Details
            </th>
          </tr>
        </thead> */}
        <tbody className="divide-y divide-gray-400 dark:divide-gray-600">
          <tr>
            <td className="px-2 py-2 w-1/6">Hash</td>
            <td className="px-2 py-2 w-5/6">{tx ? tx.tx_hash : null}</td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Block</td>
            <td className="px-2 py-2 w-5/6">{tx ? tx.block_height : null}</td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Type</td>
            <td className="px-2 py-2 w-5/6">
              {tx ? <TransactionTypeLabel type={tx.type} /> : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Amount</td>
            <td className="px-2 py-2 w-5/6">
              {tx != null ? (
                <>
                  {formatNumber(Math.abs(Number(tx.amount.value)) / 1e8)}{" "}
                  <span className="text-xs">ICP</span>
                </>
              ) : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Timestamp</td>
            <td className="px-2 py-2 w-5/6">
              {date ? (
                <>
                  {date.toLocaleString({
                    ...DateTime.DATETIME_FULL_WITH_SECONDS,
                    hour12: false,
                  })}{" "}
                  ({date.toRelative()})
                </>
              ) : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">From</td>
            <td
              className={classnames(
                "px-2 py-2 w-5/6 overflow-hidden overflow-ellipsis",
                {
                  "text-blue-600": tx && tx.type !== "MINT",
                }
              )}
            >
              {tx ? (
                tx.type === "MINT" ? (
                  "Mint"
                ) : (
                  <Link href={`/account/${tx.from}`}>
                    <a className="hover:underline">
                      {accounts[tx.from] || tx.from}
                    </a>
                  </Link>
                )
              ) : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">To</td>
            <td
              className={classnames(
                "px-2 py-2 w-5/6 overflow-hidden overflow-ellipsis",
                {
                  "text-blue-600": tx && tx.type !== "BURN",
                }
              )}
            >
              {tx ? (
                tx.type === "BURN" ? (
                  "Burn"
                ) : (
                  <Link href={`/account/${tx.to}`}>
                    <a className="hover:underline">
                      {accounts[tx.to] || tx.to}
                    </a>
                  </Link>
                )
              ) : null}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-2 w-1/6">Fee</td>
            <td className="px-2 py-2 w-5/6">
              {tx ? (
                tx.fee ? (
                  <>
                    {formatNumber(
                      Math.abs(Number(tx.fee.value)) /
                        10 ** tx.fee.currency.decimals
                    )}{" "}
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
            <td className="px-2 py-2 w-5/6">{tx ? tx.memo : null}</td>
          </tr>
        </tbody>
      </table>
    </div>
  ) : (
    <Search404 input={transactionId} />
  );
};

export default Transaction;
