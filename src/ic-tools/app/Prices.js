import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { Actor, HttpAgent, IDL } from "@dfinity/agent";
import governanceIdl, {
  UpdateIcpXdrConversionRatePayload,
} from "../canisters/governance.did.js";
import canisterIds from "../canisters/canister_ids.json";
import useInterval from "../lib/useInterval";

const agent = new HttpAgent({ host: "https://ic0.app" });
const governance = Actor.createActor(governanceIdl, {
  agent,
  canisterId: canisterIds.governance.mercury,
});

const formatTimestamp = (ts) =>
  DateTime.fromSeconds(ts).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);

const count = 100;

function Prices() {
  const [xdrUsd, setXdrUsd] = useState(null);
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetch(
      "https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=525137aa937527f317b6"
    ).then((res) =>
      res.ok
        ? res.json().then((res) => setXdrUsd(res.XDR_USD))
        : setXdrUsd(1.44)
    );
  }, []);

  const fetchData = async () => {
    const data = await governance.list_proposals({
      include_reward_status: [0, 1, 2, 3, 4],
      before_proposal: [],
      limit: proposals.length ? 1 : count,
      exclude_topic: [1, 3, 4, 5, 6, 7, 8, 9, 10],
      include_status: [1, 2, 3, 4, 5],
    });

    const filtered = data.proposal_info.filter(
      (p) => !proposals.length || p.id[0].id > proposals[0].id
    );

    const formatted = filtered.map((p) => {
      const payload = IDL.decode(
        [UpdateIcpXdrConversionRatePayload(IDL)],
        Buffer.from(p.proposal[0].action[0].ExecuteNnsFunction.payload)
      );
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
  };

  useEffect(fetchData, []);
  useInterval(fetchData, 30 * 1000);

  let latestPrice = null;
  let timestamp = null;
  if (proposals.length > 0) {
    latestPrice = `${proposals[0].icp_xdr.toFixed(4)} XDR`;
    if (xdrUsd) {
      latestPrice = `${latestPrice} / $${(
        proposals[0].icp_xdr * xdrUsd
      ).toFixed(2)}`;
    }

    const ts = DateTime.fromSeconds(proposals[0].timestamp_executed);
    timestamp = `${ts.toLocaleString(
      DateTime.DATETIME_SHORT_WITH_SECONDS
    )} (${ts.toRelative()})`;
  }

  return (
    <div className="font-mono">
      <section className="py-16">
        <h2 className="text-3xl mb-4">Latest ICP price: {latestPrice}</h2>
        <h2 className="text-2xl mb-8">Timestamp: {timestamp}</h2>
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
