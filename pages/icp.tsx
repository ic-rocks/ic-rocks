import { Actor, HttpAgent, IDL } from "@dfinity/agent";
import { DateTime } from "luxon";
import Head from "next/head";
import { useEffect, useState } from "react";
import governanceIdl from "../lib/canisters/governance.did";
import nnsUiIdl from "../lib/canisters/nns-ui.did";
import useInterval from "../lib/useInterval";
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
      const ts = DateTime.fromSeconds(proposals[0].timestamp_executed);
      timestamp = `${ts.toLocaleString(
        DateTime.DATETIME_SHORT_WITH_SECONDS
      )} (${ts.toRelative()})`;
    }
  }

  return (
    <div className="font-mono">
      <Head>
        <title>ICP Price | IC Tools</title>
      </Head>
      <section className="py-16">
        <h2 className="text-3xl mb-4">Latest ICP price: {latestPrice}</h2>
        <h2 className="mb-4">Timestamp: {timestamp}</h2>
        <h2 className="mb-8">{xdrUsd ? `1 XDR = ${xdrUsd} USD` : null}</h2>
        <p>
          Price data is read from the governance canister, and acts as an
          on-chain oracle of ICP price.
        </p>
      </section>
      <label className="py-8">Latest {count} price updates:</label>
      <ul className="list-none">
        <li className="grid grid-cols-8">
          <div>ID</div>
          <div>Proposed Timestamp</div>
          <div>Executed Timestamp</div>
          <div>Payload Timestamp</div>
          <div>ICP Source</div>
          <div>SDR Source</div>
          <div>Price (XDR)</div>
          <div>Price (USD)</div>
        </li>
        {proposals.map((proposal) => {
          return (
            <li
              key={proposal.id}
              className="grid grid-cols-8 gap-1 border-t border-gray-800"
            >
              <div>{proposal.id.toString()}</div>
              <div>{formatTimestamp(proposal.timestamp_proposal)}</div>
              <div>{formatTimestamp(proposal.timestamp_executed)}</div>
              <div>{formatTimestamp(proposal.timestamp_payload)}</div>
              <div>{proposal.source.icp}</div>
              <div>{proposal.source.sdr}</div>
              <div>{proposal.icp_xdr.toFixed(4)}</div>
              <div>
                {xdrUsd ? `${(xdrUsd * proposal.icp_xdr).toFixed(2)}` : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Prices;
