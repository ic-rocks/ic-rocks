import classnames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import BalanceLabel from "../../components/Labels/BalanceLabel";
import { TimestampLabel } from "../../components/Labels/TimestampLabel";
import { TransactionTypeLabel } from "../../components/Labels/TransactionTypeLabel";
import { MetaTags } from "../../components/MetaTags";
import Search404 from "../../components/Search404";
import { useGlobalState } from "../../components/StateContext";
import fetchJSON from "../../lib/fetch";
import { formatNumberUSD } from "../../lib/numbers";
import { Transaction, TransactionsResponse } from "../../lib/types/API";

const TransactionPage = () => {
  const router = useRouter();
  const [data, setData] = useState<Transaction>(null);
  const [isValid, setIsValid] = useState(true);
  const [isLoadingTxs, setIsLoadingTxs] = useState(false);
  const { transactionId } = router.query as { transactionId: string };
  const { markets } = useGlobalState();

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
    <div className="pb-16">
      <MetaTags
        title={`Transaction${transactionId ? ` ${transactionId}` : ""}`}
        description={`Details for transaction${
          transactionId ? ` ${transactionId}` : ""
        } on the Internet Computer ledger.`}
      />
      <h1 className="text-3xl my-8">Transaction Details</h1>
      <table className="table-fixed w-full">
        <tbody className="divide-y divide-default">
          <tr className="flex">
            <td className="px-2 py-2 w-24">Hash</td>
            <td className="px-2 py-2 flex-1 overflow-hidden overflow-ellipsis">
              {data ? data.id : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-24">Block</td>
            <td className="px-2 py-2 flex-1">
              {data ? data.blockHeight : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-24">Type</td>
            <td className="px-2 py-2 flex-1">
              {data ? <TransactionTypeLabel type={data.type} /> : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-24">Timestamp</td>
            <td className="px-2 py-2 flex-1">
              {data ? (
                <TimestampLabel dt={DateTime.fromISO(data.createdDate)} />
              ) : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-24">From</td>
            <td
              className={classnames(
                "px-2 py-2 flex-1 overflow-hidden flex",
                {}
              )}
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
          <tr className="flex">
            <td className="px-2 py-2 w-24">To</td>
            <td
              className={classnames(
                "px-2 py-2 flex-1 overflow-hidden flex",
                {}
              )}
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
          <tr className="flex">
            <td className="px-2 py-2 w-24">Amount</td>
            <td className="px-2 py-2 flex-1">
              {data != null ? (
                <>
                  <BalanceLabel value={data.amount} />
                  {markets?.ticker && (
                    <small className="ml-1 text-xs">
                      (
                      {formatNumberUSD(
                        (Number(markets.ticker.price) * Number(data.amount)) /
                          1e8
                      )}
                      )
                    </small>
                  )}
                </>
              ) : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-24">Fee</td>
            <td className="px-2 py-2 flex-1">
              {data ? (
                data.fee ? (
                  <>
                    <BalanceLabel value={data.fee} />
                    {markets?.ticker && (
                      <small className="ml-1 text-xs">
                        (
                        {formatNumberUSD(
                          (Number(markets.ticker.price) * Number(data.fee)) /
                            1e8
                        )}
                        )
                      </small>
                    )}
                  </>
                ) : (
                  0
                )
              ) : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-24">Memo</td>
            <td className="px-2 py-2 flex-1 break-all">
              {data ? data.memo : null}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ) : (
    <Search404 input={transactionId} />
  );
};

export default TransactionPage;
