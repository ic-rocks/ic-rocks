import React, { useEffect, useState } from "react";
import BalanceLabel from "../components/Labels/BalanceLabel";
import Ledger from "../components/LedgerPage";
import { MetaTags } from "../components/MetaTags";
import { TransactionsTable } from "../components/TransactionsTable";
import fetchJSON from "../lib/fetch";
import { formatNumber } from "../lib/numbers";

const Transactions = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchJSON("/api/transactions/stats").then(setStats);
  }, []);

  return (
    <Ledger title="Transactions">
      <MetaTags
        title="Transactions"
        description="A list of transactions on the Internet Computer ledger."
      />
      <section>
        <table className="table-fixed w-full">
          <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
            <tr className="flex">
              <td className="px-2 py-2 w-28 sm:w-44">Total Transactions</td>
              <td className="px-2 py-2 flex-1 overflow-hidden overflow-ellipsis">
                {stats ? formatNumber(stats.stats.count) : null}
              </td>
            </tr>
            <tr className="flex">
              <td className="px-2 py-2 w-28 sm:w-44">Total Minted</td>
              <td className="px-2 py-2 flex-1">
                {stats ? (
                  <BalanceLabel value={stats.stats.total_minted} />
                ) : null}
              </td>
            </tr>
            <tr className="flex">
              <td className="px-2 py-2 w-28 sm:w-44">Total Burned</td>
              <td className="px-2 py-2 flex-1">
                {stats ? (
                  <BalanceLabel value={stats.stats.total_burned} />
                ) : null}
              </td>
            </tr>
            <tr className="flex">
              <td className="px-2 py-2 w-28 sm:w-44">Total Fees</td>
              <td className="px-2 py-2 flex-1">
                {stats ? <BalanceLabel value={stats.stats.total_fees} /> : null}
              </td>
            </tr>
            <tr className="flex">
              <td className="px-2 py-2 w-28 sm:w-44">Average Transfer</td>
              <td className="px-2 py-2 flex-1">
                {stats ? (
                  <BalanceLabel value={stats.stats.avg_transferred} />
                ) : null}
              </td>
            </tr>
            <tr className="flex">
              <td className="px-2 py-2 w-28 sm:w-44">Unique Senders</td>
              <td className="px-2 py-2 flex-1">
                {stats ? formatNumber(stats.stats.senders) : null}
              </td>
            </tr>
            <tr className="flex">
              <td className="px-2 py-2 w-28 sm:w-44">Unique Receivers</td>
              <td className="px-2 py-2 flex-1">
                {stats ? formatNumber(stats.stats.receivers) : null}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <section className="mt-8">
        <TransactionsTable />
      </section>
    </Ledger>
  );
};

export default Transactions;
