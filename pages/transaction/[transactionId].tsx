import classnames from "classnames";
import { DateTime } from "luxon";
import React from "react";
import { useQuery } from "react-query";
import BalanceLabel from "../../components/Labels/BalanceLabel";
import IdentifierLink from "../../components/Labels/IdentifierLink";
import { TimestampLabel } from "../../components/Labels/TimestampLabel";
import { TransactionTypeLabel } from "../../components/Labels/TransactionTypeLabel";
import { MetaTags } from "../../components/MetaTags";
import Search404 from "../../components/Search404";
import fetchJSON from "../../lib/fetch";
import useMarkets from "../../lib/hooks/useMarkets";
import { formatNumberUSD } from "../../lib/numbers";
import { isAccountOrTransaction } from "../../lib/strings";
import { Transaction } from "../../lib/types/API";

export async function getServerSideProps({ params }) {
  const { transactionId } = params;
  const isValid = !!transactionId && isAccountOrTransaction(transactionId);
  return { props: { isValid, transactionId } };
}

const TransactionPage = ({
  isValid,
  transactionId,
}: {
  isValid: boolean;
  transactionId: string;
}) => {
  if (!isValid) {
    return <Search404 input={transactionId} />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data } = useQuery<Transaction>(
    ["transaction", transactionId],
    () => fetchJSON(`/api/transactions/${transactionId}`),
    { staleTime: Infinity },
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: markets } = useMarkets();

  return (
    <div className="pb-16">
      <MetaTags
        title={`Transaction ${transactionId}`}
        description={`Details for transaction ${transactionId} on the Internet Computer ledger.`}
      />
      <h1 className="my-8 text-3xl">Transaction Details</h1>
      <table className="w-full table-fixed">
        <tbody className="divide-y divide-default">
          <tr className="flex">
            <td className="py-2 px-2 w-24">Hash</td>
            <td className="overflow-hidden flex-1 py-2 px-2 overflow-ellipsis">
              {data ? data.id : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="py-2 px-2 w-24">Block</td>
            <td className="flex-1 py-2 px-2">
              {data ? data.blockHeight : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="py-2 px-2 w-24">Type</td>
            <td className="flex-1 py-2 px-2">
              {data ? <TransactionTypeLabel type={data.type} /> : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="py-2 px-2 w-24">Timestamp</td>
            <td className="flex-1 py-2 px-2">
              {data ? (
                <TimestampLabel dt={DateTime.fromISO(data.createdDate)} />
              ) : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="py-2 px-2 w-24">From</td>
            <td
              className={classnames(
                "flex overflow-hidden flex-1 py-2 px-2",
                {},
              )}
            >
              {data ? (
                data.type === "MINT" ? (
                  "Mint"
                ) : (
                  <IdentifierLink
                    type="account"
                    id={data.senderId}
                    name={data.sender?.name}
                  />
                )
              ) : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="py-2 px-2 w-24">To</td>
            <td
              className={classnames(
                "flex overflow-hidden flex-1 py-2 px-2",
                {},
              )}
            >
              {data ? (
                data.type === "BURN" ? (
                  "Burn"
                ) : (
                  <IdentifierLink
                    type="account"
                    id={data.receiverId}
                    name={data.receiver?.name}
                  />
                )
              ) : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="py-2 px-2 w-24">Amount</td>
            <td className="flex-1 py-2 px-2">
              {data != null ? (
                <>
                  <BalanceLabel value={data.amount} />
                  {markets?.ticker && (
                    <small className="ml-1 text-xs">
                      (
                      {formatNumberUSD(
                        (Number(markets.ticker.price) * Number(data.amount)) /
                          1e8,
                      )}
                      )
                    </small>
                  )}
                </>
              ) : null}
            </td>
          </tr>
          <tr className="flex">
            <td className="py-2 px-2 w-24">Fee</td>
            <td className="flex-1 py-2 px-2">
              {data ? (
                data.fee ? (
                  <>
                    <BalanceLabel value={data.fee} />
                    {markets?.ticker && (
                      <small className="ml-1 text-xs">
                        (
                        {formatNumberUSD(
                          (Number(markets.ticker.price) * Number(data.fee)) /
                            1e8,
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
            <td className="py-2 px-2 w-24">Memo</td>
            <td className="flex-1 py-2 px-2 break-all">
              {data ? data.memo : null}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TransactionPage;
