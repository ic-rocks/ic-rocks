import React, { useEffect, useState } from "react";
import Ledger from "../components/LedgerPage";
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
      <section>
        <table className="table-fixed w-full">
          <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
            <tr>
              <td className="px-2 py-2 w-1/6">Total Transactions</td>
              <td className="px-2 py-2 w-5/6 overflow-hidden overflow-ellipsis">
                {stats ? formatNumber(stats.stats.count) : null}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-2 w-1/6">Total Minted</td>
              <td className="px-2 py-2 w-5/6">
                {stats ? (
                  <>
                    {formatNumber(Number(stats.stats.total_minted) / 1e8)}{" "}
                    <span className="text-xs">ICP</span>
                  </>
                ) : null}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-2 w-1/6">Total Burned</td>
              <td className="px-2 py-2 w-5/6">
                {stats ? (
                  <>
                    {formatNumber(Number(stats.stats.total_burned) / 1e8)}{" "}
                    <span className="text-xs">ICP</span>
                  </>
                ) : null}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-2 w-1/6">Total Fees</td>
              <td className="px-2 py-2 w-5/6">
                {stats ? (
                  <>
                    {formatNumber(Number(stats.stats.total_fees) / 1e8)}{" "}
                    <span className="text-xs">ICP</span>
                  </>
                ) : null}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-2 w-1/6">Average Transfer</td>
              <td className="px-2 py-2 w-5/6">
                {stats ? (
                  <>
                    {formatNumber(Number(stats.stats.avg_transferred) / 1e8)}{" "}
                    <span className="text-xs">ICP</span>
                  </>
                ) : null}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-2 w-1/6">Unique Senders</td>
              <td className="px-2 py-2 w-5/6">
                {stats ? formatNumber(stats.stats.senders) : null}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-2 w-1/6">Unique Receivers</td>
              <td className="px-2 py-2 w-5/6">
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
