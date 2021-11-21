import { Actor, HttpAgent } from "@dfinity/agent";
import { DateTime } from "luxon";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { useQuery } from "react-query";
import ledgerIdl from "../../lib/canisters/ledger.did";
import fetchJSON from "../../lib/fetch";
import useMarkets from "../../lib/hooks/useMarkets";
import useTags from "../../lib/hooks/useTags";
import { formatNumber, formatNumberUSD } from "../../lib/numbers";
import { Account } from "../../lib/types/API";
import { NeuronState } from "../../lib/types/governance";
import BalanceLabel from "../Labels/BalanceLabel";
import IdentifierLink from "../Labels/IdentifierLink";
import { TaggedLabel } from "../Labels/TaggedLabel";
import TagModal from "../Modals/TagModal";
import { NeuronLabel } from "../Neurons/NeuronLabel";
import { TransactionsTable } from "../TransactionsTable";

const agent = new HttpAgent({ host: "https://ic0.app" });
const ledger = Actor.createActor(ledgerIdl, {
  agent,
  canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
});

const hideLeadingZeros = (str: string) => {
  const parts = str?.match(/(^0+)(.*$)/);
  if (parts) {
    return (
      <>
        <span className="text-gray-500">{parts[1]}</span>
        {parts[2]}
      </>
    );
  }
  return str;
};

const AccountDetails = ({ accountId }: { accountId: string }) => {
  const { data: markets } = useMarkets();

  const { data } = useQuery<Partial<Account>>(
    ["accounts", accountId],
    () => fetchJSON(`/api/accounts/${accountId}`),
    {}
  );
  const [ledgerBalance, setLedgerBalance] = useState(null);
  const [subaccount, setSubaccount] = useState(null);
  const { data: allTags } = useTags();
  const tags = allTags.private
    .filter((t) => t.accountId === accountId)
    .concat(allTags.public.filter((t) => t.accountId === accountId));

  useEffect(() => {
    setSubaccount(null);
    setLedgerBalance(null);
    async () => {
      if (data?.subaccount) {
        const buf = Buffer.from(data.subaccount, "hex");
        const filled = Buffer.concat([Buffer.alloc(32 - buf.length), buf]);
        setSubaccount(filled.toString("hex"));
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
        setLedgerBalance(ledgerBal);
      }
    };
  }, [data]);

  let neuronDissolveDate;
  if (
    data?.neuron &&
    (data.neuron.state === NeuronState["Non-Dissolving"] ||
      data.neuron.state === NeuronState.Dissolving)
  ) {
    const date = DateTime.fromISO(data.neuron.dissolveDate);
    neuronDissolveDate =
      date.diffNow().toMillis() < 0
        ? ", dissolvable now"
        : `, ${
            data.neuron.state === NeuronState["Non-Dissolving"]
              ? "dissolvable "
              : ""
          }${date.toRelativeCalendar()}`;
  }

  return (
    <>
      <table className="w-full table-fixed">
        <thead className="bg-heading">
          <tr className="flex">
            <th
              colSpan={2}
              className="flex flex-wrap flex-1 justify-between py-2 px-2"
            >
              <div className="flex gap-1">
                <label className="mr-4">Account Details</label>
                {data?.neuron?.genesisAccountId && (
                  <label className="font-normal bg-purple-200 dark:bg-purple-400 label-tag">
                    Genesis Account
                  </label>
                )}
                {data?.principal?.isKyc && (
                  <label className="font-normal bg-purple-200 dark:bg-purple-400 label-tag">
                    KYC
                  </label>
                )}
              </div>
              <TagModal
                publicTags={data?.publicTags}
                key={accountId}
                account={accountId}
              />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-default">
          <tr className="flex">
            <td className="py-2 px-2 w-32 sm:w-40">Name</td>
            <td className="flex flex-1 gap-2 items-center py-2 px-2">
              {data?.name || (!tags[0]?.label ? "-" : null)}
              {tags.map((tag, i) => (
                <TaggedLabel key={i} label={tag.label} />
              ))}
            </td>
          </tr>
          {data?.neuron?.genesisAccountId && (
            <tr className="flex">
              <td className="py-2 px-2 w-32 sm:w-40">Genesis Account</td>
              <td className="flex flex-1 py-2 px-2 oneline">
                <Link href={`/genesis/${data.neuron.genesisAccountId}`}>
                  <a className="link-overflow">
                    {data.neuron.genesisAccountId}
                  </a>
                </Link>
              </td>
            </tr>
          )}
          {data?.isNeuron && (
            <tr className="flex">
              <td className="py-2 px-2 w-32 sm:w-40">Neuron</td>
              <td className="flex-1 py-2 px-2 break-words">
                {data.neuron ? (
                  <>
                    <Link href={`/neuron/${data.neuron.id}`}>
                      <a className="mr-2 link-overflow">
                        {data.neuron.name || data.neuron.id}
                      </a>
                    </Link>
                    <NeuronLabel state={data.neuron.state}>
                      ({NeuronState[data.neuron.state]}
                      {neuronDissolveDate})
                    </NeuronLabel>
                  </>
                ) : (
                  <span className="text-gray-500">
                    Unknown{" "}
                    <span
                      aria-label="Neuron accounts are not public, and can not always be linked."
                      data-balloon-pos="down"
                      data-balloon-length="medium"
                    >
                      <BsInfoCircle className="inline ml-1 text-xs align-middle" />
                    </span>
                  </span>
                )}
              </td>
            </tr>
          )}
          <tr className="flex">
            <td className="py-2 px-2 w-32 sm:w-40">Principal</td>
            <td className="flex flex-1 py-2 px-2 oneline">
              {data?.principalId ? (
                <IdentifierLink
                  type="principal"
                  id={data.principalId}
                  name={data.principal?.name}
                />
              ) : (
                "-"
              )}
            </td>
          </tr>
          {data?.principal?.isKyc && (
            <tr className="flex">
              <td className="py-2 px-2 w-32 sm:w-40">KYC Proposal</td>
              <td className="flex flex-1 py-2 px-2 oneline">
                <Link href={`/proposal/${data.principal.kyc[0].proposalId}`}>
                  <a className="link-overflow">
                    {data.principal.kyc[0].proposalId}
                  </a>
                </Link>
              </td>
            </tr>
          )}
          <tr className="flex">
            <td className="py-2 px-2 w-32 sm:w-40">Subaccount</td>
            <td className="flex flex-1 py-2 px-2 oneline">
              {subaccount ? hideLeadingZeros(subaccount) : "-"}
            </td>
          </tr>
          <tr className="flex">
            <td className="py-2 px-2 w-32 sm:w-40">Balance</td>
            <td className="flex-1 py-2 px-2">
              {data || ledgerBalance ? (
                <BalanceLabel
                  value={data.balance ?? ledgerBalance}
                  digits={8}
                />
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr className="flex">
            <td className="py-2 px-2 w-32 sm:w-40">Value</td>
            <td className="flex-1 py-2 px-2">
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
            <td className="py-2 px-2 w-32 sm:w-40">Transactions</td>
            <td className="flex-1 py-2 px-2">
              {data?.tx_count ? formatNumber(data.tx_count) : 0}
            </td>
          </tr>
        </tbody>
      </table>

      <section className="pt-8">
        <TransactionsTable key={accountId} accountId={accountId} />
      </section>
    </>
  );
};

export default AccountDetails;
