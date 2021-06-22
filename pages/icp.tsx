import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import ActiveLink from "../components/ActiveLink";
import { MetaTags } from "../components/MetaTags";
import { SecondaryNav } from "../components/Nav/SecondaryNav";
import governanceIdl from "../lib/canisters/governance.did";
import nnsUiIdl from "../lib/canisters/nns-ui.did";
import useInterval from "../lib/hooks/useInterval";
declare const Buffer;

const UpdateIcpXdrConversionRatePayload = (IDL) =>
  IDL.Record({
    data_source: IDL.Text,
    timestamp_seconds: IDL.Nat64,
    xdr_permyriad_per_icp: IDL.Nat64,
  });

const agent = new HttpAgent({ host: "https://ic0.app" });
const governance = Actor.createActor(governanceIdl, {
  agent,
  canisterId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
});
const nnsUi = Actor.createActor(nnsUiIdl, {
  agent,
  canisterId: "qoctq-giaaa-aaaaa-aaaea-cai",
});

const formatTimestamp = (ts) =>
  DateTime.fromSeconds(ts).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);

const count = 100;

function Prices() {
  const [xdrUsd, setXdrUsd] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    fetch(
      "https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=525137aa937527f317b6"
    ).then((res) =>
      res.ok
        ? res.json().then((res) => setXdrUsd(res.XDR_USD))
        : setXdrUsd(1.44)
    );
  }, []);

  const fetchData = () => {
    (async () => {
      const data = (await governance.list_proposals({
        include_reward_status: [0, 1, 2, 3, 4].map(BigInt),
        before_proposal: [],
        limit: proposals.length ? 1 : count,
        exclude_topic: [1, 3, 4, 5, 6, 7, 8, 9, 10].map(BigInt),
        include_status: [1, 2, 3, 4, 5].map(BigInt),
      })) as { proposal_info: any[] };

      const filtered = data.proposal_info.filter(
        (p) => !proposals.length || p.id[0].id > proposals[0].id
      );

      const formatted = filtered.map((p) => {
        const payload = IDL.decode(
          [UpdateIcpXdrConversionRatePayload(IDL)],
          Buffer.from(p.proposal[0].action[0].ExecuteNnsFunction.payload)
        ) as any[];
        const source = JSON.parse(payload[0].data_source);
        return {
          id: p.id[0].id,
          status: p.status,
          topic: p.topic,
          reward_status: p.reward_status,
          latest_tally: p.latest_tally[0],
          timestamp_proposal: Number(p.proposal_timestamp_seconds),
          timestamp_decided: Number(p.decided_timestamp_seconds),
          timestamp_executed: Number(p.executed_timestamp_seconds),
          source,
          timestamp_payload: Number(payload[0].timestamp_seconds),
          icp_xdr: Number(payload[0].xdr_permyriad_per_icp) / 10000,
        };
      });
      console.log(formatted);

      setProposals((prev) => formatted.concat(prev));
    })();
  };

  const fetchPrice = () => {
    (async () => {
      const data = await nnsUi.get_icp_to_cycles_conversion_rate();
      console.log(data);
      setPrice(data);
    })();
  };

  useEffect(fetchPrice, []);
  useEffect(fetchData, []);
  useInterval(fetchPrice, 30 * 1000);
  useInterval(fetchData, 30 * 1000);

  let latestPrice = null;
  let timestamp = null;
  if (price) {
    const _price = Number(price) / 10000 / 1e8;
    latestPrice = `${_price.toFixed(4)} XDR`;
    if (xdrUsd) {
      latestPrice = `${latestPrice} / $${(_price * xdrUsd).toFixed(2)}`;
    }

    if (proposals[0]) {
      const ts = DateTime.fromSeconds(proposals[0].timestamp_payload);
      timestamp = `${ts.toLocaleString(
        DateTime.DATETIME_SHORT_WITH_SECONDS
      )} (${ts.toRelative()})`;
    }
  }

  return (
    <div>
      <MetaTags
        title="ICP Price"
        description="An overview of the ICP Price Oracle on the Internet Computer."
      />
      <SecondaryNav
        items={[
          <ActiveLink href="/proposals">Proposals</ActiveLink>,
          <ActiveLink href="/icp">ICP Price Oracle</ActiveLink>,
        ]}
      />
      <section className="pb-8">
        <h1 className="text-3xl my-8">ICP Price Oracle</h1>
        <table className="w-full">
          <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
            <tr>
              <td className="px-2 py-2 w-1/6">Latest ICP Price</td>
              <td className="px-2 py-2 w-5/6">{latestPrice}</td>
            </tr>
            <tr>
              <td className="px-2 py-2 w-1/6">Timestamp</td>
              <td className="px-2 py-2 w-5/6">{timestamp}</td>
            </tr>
            <tr>
              <td className="px-2 py-2 w-1/6">XDR Rate</td>
              <td className="px-2 py-2 w-5/6">
                {xdrUsd ? `1 XDR = ${xdrUsd} USD` : null}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="px-2 py-2">
                Price data is read from the governance canister, and acts as an
                on-chain oracle of ICP price.
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <h2 className="text-xl mb-4">Latest {count} price updates</h2>
      <table className="table-auto w-full">
        <thead className="bg-heading">
          <tr>
            <th className="px-2 py-2">ID</th>
            <th className="px-2 py-2">Proposed Timestamp</th>
            <th className="px-2 py-2">Executed Timestamp</th>
            <th className="px-2 py-2">Payload Timestamp</th>
            <th className="px-2 py-2">ICP Source</th>
            <th className="px-2 py-2">SDR Source</th>
            <th className="px-2 py-2">Price (XDR)</th>
            <th className="px-2 py-2">Price (USD)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
          {proposals.map((proposal) => {
            return (
              <tr key={proposal.id}>
                <td className="px-2 py-2">{proposal.id.toString()}</td>
                <td className="px-2 py-2">
                  {formatTimestamp(proposal.timestamp_proposal)}
                </td>
                <td className="px-2 py-2">
                  {formatTimestamp(proposal.timestamp_executed)}
                </td>
                <td className="px-2 py-2">
                  {formatTimestamp(proposal.timestamp_payload)}
                </td>
                <td className="px-2 py-2">{proposal.source.icp}</td>
                <td className="px-2 py-2">{proposal.source.sdr}</td>
                <td className="px-2 py-2">{proposal.icp_xdr.toFixed(4)}</td>
                <td className="px-2 py-2">
                  {xdrUsd ? `${(xdrUsd * proposal.icp_xdr).toFixed(2)}` : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Prices;
