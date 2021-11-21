import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { MetaTags } from "../../components/MetaTags";
import ProposalNav from "../../components/Proposals/ProposalNav";
import governanceIdl from "../../lib/canisters/governance.did";
import nnsUiIdl from "../../lib/canisters/nns-ui.did";
import useInterval from "../../lib/hooks/useInterval";
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as { proposal_info: any[] };

      const filtered = data.proposal_info.filter(
        (p) => !proposals.length || p.id[0].id > proposals[0].id
      );

      const formatted = filtered.map((p) => {
        const payload = IDL.decode(
          [UpdateIcpXdrConversionRatePayload(IDL)],
          Buffer.from(p.proposal[0].action[0].ExecuteNnsFunction.payload)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <ProposalNav />
      <section className="pb-8">
        <h1 className="my-8 text-3xl">ICP Price Oracle</h1>
        <table className="w-full">
          <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
            <tr>
              <td className="py-2 px-2 w-1/6">Latest ICP Price</td>
              <td className="py-2 px-2 w-5/6">{latestPrice}</td>
            </tr>
            <tr>
              <td className="py-2 px-2 w-1/6">Timestamp</td>
              <td className="py-2 px-2 w-5/6">{timestamp}</td>
            </tr>
            <tr>
              <td className="py-2 px-2 w-1/6">XDR Rate</td>
              <td className="py-2 px-2 w-5/6">
                {xdrUsd ? `1 XDR = ${xdrUsd} USD` : null}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="py-2 px-2">
                Price data is read from the governance canister, and acts as an
                on-chain oracle of ICP price.
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <h2 className="mb-4 text-xl">Latest {count} price updates</h2>
      <table className="w-full table-auto">
        <thead className="bg-heading">
          <tr>
            <th className="py-2 px-2">ID</th>
            <th className="py-2 px-2">Proposed Timestamp</th>
            <th className="py-2 px-2">Executed Timestamp</th>
            <th className="py-2 px-2">Payload Timestamp</th>
            <th className="py-2 px-2">ICP Source</th>
            <th className="py-2 px-2">SDR Source</th>
            <th className="py-2 px-2">Price (XDR)</th>
            <th className="py-2 px-2">Price (USD)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
          {proposals.map((proposal) => {
            return (
              <tr key={proposal.id}>
                <td className="py-2 px-2">{proposal.id.toString()}</td>
                <td className="py-2 px-2">
                  {formatTimestamp(proposal.timestamp_proposal)}
                </td>
                <td className="py-2 px-2">
                  {formatTimestamp(proposal.timestamp_executed)}
                </td>
                <td className="py-2 px-2">
                  {formatTimestamp(proposal.timestamp_payload)}
                </td>
                <td className="py-2 px-2">{proposal.source.icp}</td>
                <td className="py-2 px-2">{proposal.source.sdr}</td>
                <td className="py-2 px-2">{proposal.icp_xdr.toFixed(4)}</td>
                <td className="py-2 px-2">
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
