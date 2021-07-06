import { Actor, HttpAgent } from "@dfinity/agent";
import { getCrc32 } from "@dfinity/principal/lib/cjs/utils/getCrc";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import BalanceLabel from "../../components/Labels/BalanceLabel";
import IdentifierLink from "../../components/Labels/IdentifierLink";
import { TaggedLabel } from "../../components/Labels/TaggedLabel";
import { MetaTags } from "../../components/MetaTags";
import TagModal from "../../components/Modals/TagModal";
import { NeuronLabel } from "../../components/Neurons/NeuronLabel";
import Search404 from "../../components/Search404";
import { TransactionsTable } from "../../components/TransactionsTable";
import ledgerIdl from "../../lib/canisters/ledger.did";
import fetchJSON from "../../lib/fetch";
import useMarkets from "../../lib/hooks/useMarkets";
import useTags from "../../lib/hooks/useTags";
import { formatNumber, formatNumberUSD } from "../../lib/numbers";
import { Account } from "../../lib/types/API";
import { NeuronState } from "../../lib/types/governance";

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

const AccountPage = () => {
  const router = useRouter();

  const { accountId: accountId_ } = router.query as { accountId: string };
  const { data: markets } = useMarkets();
  const accountId = accountId_?.toLowerCase();

  const isValid = useMemo(() => {
    if (typeof accountId !== "string" || !accountId) return false;
    try {
      const blob = Buffer.from(accountId, "hex");
      const crc32Buf = Buffer.alloc(4);
      crc32Buf.writeUInt32BE(getCrc32(blob.slice(4)));
      return blob.slice(0, 4).toString() === crc32Buf.toString();
    } catch (error) {
      console.warn(error);
    }
    return false;
  }, [accountId]);

  const { data } = useQuery<Partial<Account>>(
    ["accounts", accountId],
    () => fetchJSON(`/api/accounts/${accountId}`),
    {
      enabled: isValid,
    }
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

  if (accountId && !isValid) {
    return <Search404 input={accountId} />;
  }

  let neuronDissolveDate;
  if (
    data?.neuron &&
    (data.neuron.state === NeuronState.Locked ||
      data.neuron.state === NeuronState.Dissolving)
  ) {
    const date = DateTime.fromISO(data.neuron.dissolveDate);
    neuronDissolveDate =
      date.diffNow().toMillis() < 0
        ? ", dissolvable now"
        : `, ${
            data.neuron.state === NeuronState.Locked ? "dissolvable " : ""
          }${date.toRelative()}`;
  }

  return (
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
            <th
              colSpan={2}
              className="px-2 py-2 flex-1 flex flex-wrap justify-between"
            >
              <div className="flex gap-1">
                <label className="mr-4">Account Details</label>
                {data?.neuron?.genesisAccountId && (
                  <label className="font-normal label-tag bg-purple-200 dark:bg-purple-400">
                    Genesis Account
                  </label>
                )}
                {data?.principal?.isKyc && (
                  <label className="font-normal label-tag bg-purple-200 dark:bg-purple-400">
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
            <td className="px-2 py-2 w-32 sm:w-40">Name</td>
            <td className="px-2 py-2 flex-1 flex items-center gap-2">
              {data?.name || (!tags[0]?.label ? "-" : null)}
              {tags.map((tag, i) => (
                <TaggedLabel key={i} label={tag.label} />
              ))}
            </td>
          </tr>
          {data?.neuron?.genesisAccountId && (
            <tr className="flex">
              <td className="px-2 py-2 w-32 sm:w-40">Genesis Account</td>
              <td className="px-2 py-2 flex-1 flex oneline">
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
              <td className="px-2 py-2 w-32 sm:w-40">Neuron</td>
              <td className="px-2 py-2 flex-1 overflow-hidden break-words">
                {data.neuron ? (
                  <>
                    <Link href={`/neuron/${data.neuron.id}`}>
                      <a className="link-overflow mr-2">
                        {data.neuron.name || data.neuron.id}
                      </a>
                    </Link>
                    <NeuronLabel state={data.neuron.state}>
                      ({NeuronState[data.neuron.state]}
                      {neuronDissolveDate})
                    </NeuronLabel>
                  </>
                ) : (
                  "Unknown"
                )}
              </td>
            </tr>
          )}
          <tr className="flex">
            <td className="px-2 py-2 w-32 sm:w-40">Principal</td>
            <td className="px-2 py-2 flex-1 flex oneline">
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
              <td className="px-2 py-2 w-32 sm:w-40">KYC Proposal</td>
              <td className="px-2 py-2 flex-1 flex oneline">
                <Link href={`/proposal/${data.principal.kyc[0].proposalId}`}>
                  <a className="link-overflow">
                    {data.principal.kyc[0].proposalId}
                  </a>
                </Link>
              </td>
            </tr>
          )}
          <tr className="flex">
            <td className="px-2 py-2 w-32 sm:w-40">Subaccount</td>
            <td className="px-2 py-2 flex-1 flex oneline">
              {subaccount ? hideLeadingZeros(subaccount) : "-"}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-32 sm:w-40">Balance</td>
            <td className="px-2 py-2 flex-1">
              {data || ledgerBalance ? (
                <BalanceLabel value={data.balance ?? ledgerBalance} />
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr className="flex">
            <td className="px-2 py-2 w-32 sm:w-40">Value</td>
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
            <td className="px-2 py-2 w-32 sm:w-40">Transactions</td>
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
  );
};

export default AccountPage;
