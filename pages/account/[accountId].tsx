import { Actor, blobFromHex, HttpAgent } from "@dfinity/agent";
import { getCrc32 } from "@dfinity/agent/lib/cjs/utils/getCrc";
import { DateTime } from "luxon";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ledgerIdl from "../../lib/canisters/ledger.did";
import nnsUiIdl from "../../lib/canisters/nns-ui.did";
import { TITLE_SUFFIX } from "../../lib/constants";

type TransactionResult = {
  transactions: {
    block_identifier: {
      index: number;
      hash: string;
    };
    transaction: {
      transaction_identifier: {
        hash: string;
      };
      operations: {
        operation_identifier: {
          index: number;
        };
        type: string;
        status: string;
        account: {
          address: string;
        };
        amount: {
          value: string;
          currency: {
            symbol: string;
            decimals: number;
          };
        };
      }[];
      metadata: {
        block_height: number;
        memo: number;
        timestamp: number;
      };
    };
  }[];
  total_count: number;
};

const agent = new HttpAgent({ host: "https://ic0.app" });
const ledger = Actor.createActor(ledgerIdl, {
  agent,
  canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
});
const nnsUi = Actor.createActor(nnsUiIdl, {
  agent,
  canisterId: "qoctq-giaaa-aaaaa-aaaea-cai",
});

const Account = () => {
  const router = useRouter();
  const [balance, setBalance] = useState(null);
  const [txs, setTxs] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const { accountId } = router.query as { accountId: string };

  useEffect(() => {
    if (typeof accountId !== "string" || !accountId) return;

    setBalance(null);
    setTxs(null);

    const blob = blobFromHex(accountId);
    const crc32Buf = Buffer.alloc(4);
    crc32Buf.writeUInt32BE(getCrc32(blob.slice(4)));
    const valid = blob.slice(0, 4).toString() === crc32Buf.toString();
    setIsValid(valid);

    if (valid) {
      (async () => {
        const res = (await ledger.account_balance_dfx({
          account: accountId,
        })) as { es8: BigInt };
        setBalance(res!.e8s);

        fetch("https://rosetta-api.internetcomputer.org/search/transactions", {
          body: JSON.stringify({
            network_identifier: {
              blockchain: "Internet Computer",
              network: "00000000000000020101",
            },
            account_identifier: {
              address: accountId,
            },
          }),
          method: "POST",
          headers: {
            "content-type": "application/json;charset=UTF-8",
          },
        })
          .then((res) => res.json())
          .then((json: TransactionResult) =>
            setTxs({
              total_count: json.total_count,
              transactions: json.transactions.reverse().map((tx) => ({
                ...tx.transaction.metadata,
                block_hash: tx.block_identifier.hash,
                tx_hash: tx.transaction.transaction_identifier.hash,
                from: tx.transaction.operations[0].account.address,
                to: tx.transaction.operations[1].account.address,
                amount: tx.transaction.operations[1].amount,
                fee: tx.transaction.operations[2].amount,
              })),
            })
          );
      })();
    }
  }, [accountId]);

  const title = isValid ? `Account ${accountId}` : "Account not found";

  return (
    <div className="py-16">
      <Head>
        <title>
          {title} {TITLE_SUFFIX}
        </title>
      </Head>
      <h1 className="text-3xl mb-8">
        {isValid ? (
          <>
            Account <small className="text-2xl">{accountId}</small>
          </>
        ) : (
          title
        )}
      </h1>
      <table className="w-full border-collapse border border-gray-800">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th
              colSpan={2}
              className="border border-gray-400 dark:border-gray-600 px-2 py-2"
            >
              Account Details
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 dark:border-gray-600 px-2 w-1/4">
              Balance
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 font-mono w-3/4">
              {balance != null ? (Number(balance) / 1e8).toFixed(8) : "-"}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full table-fixed border-collapse border border-gray-800 mt-8">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr className="border border-gray-400 dark:border-gray-600">
            <th className="text-left px-2 py-2 w-16">Tx Hash</th>
            <th className="text-left px-2 py-2 w-16">Timestamp</th>
            <th className="text-left px-2 py-2 w-16">From</th>
            <th className="text-left px-2 py-2 w-16">To</th>
            <th className="text-left px-2 py-2 w-16">Amount</th>
            <th className="text-left px-2 py-2 w-16">Fee</th>
          </tr>
        </thead>
        <tbody>
          {txs ? (
            txs.transactions.length > 0 ? (
              txs.transactions.slice(0, 25).map((tx) => {
                return (
                  <tr
                    key={tx.tx_hash}
                    className="border border-gray-400 dark:border-gray-600"
                  >
                    <td className="px-2 py-2 overflow-hidden overflow-ellipsis">
                      {tx.tx_hash}
                    </td>
                    <td className="px-2 py-2 overflow-hidden overflow-ellipsis">
                      {DateTime.fromMillis(tx.timestamp / 1e6).toRelative()}
                    </td>
                    <td className="px-2 py-2 overflow-hidden overflow-ellipsis">
                      {tx.from === accountId ? (
                        tx.from
                      ) : (
                        <Link href={`/account/${tx.from}`}>
                          <a className="hover:underline text-blue-600">
                            {tx.from}
                          </a>
                        </Link>
                      )}
                    </td>
                    <td className="px-2 py-2 overflow-hidden overflow-ellipsis">
                      {tx.to === accountId ? (
                        tx.to
                      ) : (
                        <Link href={`/account/${tx.to}`}>
                          <a className="hover:underline text-blue-600">
                            {tx.to}
                          </a>
                        </Link>
                      )}
                    </td>
                    <td className="px-2 py-2 overflow-hidden overflow-ellipsis">
                      {Number(tx.amount.value) /
                        10 ** tx.amount.currency.decimals}{" "}
                      <span className="text-xs">
                        {tx.amount.currency.symbol}
                      </span>
                    </td>
                    <td className="px-2 py-2 overflow-hidden overflow-ellipsis">
                      {Math.abs(Number(tx.fee.value)) /
                        10 ** tx.fee.currency.decimals}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="border border-gray-400 dark:border-gray-600">
                <td
                  colSpan={6}
                  className="text-center py-2 italic text-gray-600 dark:text-gray-400"
                >
                  No transactions found.
                </td>
              </tr>
            )
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default Account;
