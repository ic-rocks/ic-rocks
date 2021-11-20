import { DateTime } from "luxon";
import Link from "next/link";
import React from "react";
import { decodeBlob } from "../../lib/candid/utils";
import { addCrc32 } from "../../lib/identifiers";
import { Proposal } from "../../lib/types/API";
import { Action, NnsFunction } from "../../lib/types/governance";
import BalanceLabel from "../Labels/BalanceLabel";
import IdentifierLink from "../Labels/IdentifierLink";
import { TimestampLabel } from "../Labels/TimestampLabel";

export const ProposalSummary = ({ proposal }: { proposal: Proposal }) => {
  if (proposal.nnsFunction === NnsFunction["ICP XDR Conversion Rate"]) {
    const data = JSON.parse(proposal.payloadJson);
    const source = JSON.parse(data.data_source);
    return (
      <div className="flex flex-col gap-2 text-xs">
        <div>
          <strong>Date Source</strong>
          <div className="flex">
            <label className="w-8">ICP</label>
            {source.icp.join(", ")}
          </div>
          <div className="flex">
            <label className="w-8">SDR</label>
            {source.sdr}
          </div>
        </div>
        <div>
          <strong>Timestamp</strong>
          <div>
            <TimestampLabel
              dt={DateTime.fromSeconds(Number(data.timestamp_seconds))}
            />
          </div>
        </div>
      </div>
    );
  }

  if (proposal.action === Action["Add or Remove Node Provider"]) {
    const data = JSON.parse(proposal.payloadJson);
    return (
      <div className="text-xs">
        <strong>Principal</strong>
        <div>
          <IdentifierLink type="principal" id={data} />
        </div>
      </div>
    );
  }

  if (proposal.action === Action["Approve Genesis KYC"]) {
    const data = JSON.parse(proposal.payloadJson);
    return (
      <div className="text-xs">
        <strong>Principals</strong>
        <ul>
          {data.map((pid) => (
            <li key={pid}>
              <IdentifierLink type="principal" id={pid} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (proposal.nnsFunction === NnsFunction["Set Authorized Subnetworks"]) {
    const data = JSON.parse(proposal.payloadJson);
    return (
      <div className="flex flex-col gap-2 text-xs">
        <div>
          <strong>Who</strong>
          <ul>
            {data.who.map((pid) => (
              <li key={pid}>
                <IdentifierLink type="principal" id={pid} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Subnets</strong>
          <ul>
            {data.subnets.map((id) => (
              <li key={id}>
                <Link href={`/subnet/${id}`}>
                  <a className="link-overflow">{id}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (proposal.nnsFunction === NnsFunction["Add Node to Subnet"]) {
    const data = JSON.parse(proposal.payloadJson);
    return (
      <div className="flex flex-col gap-2 text-xs">
        <div>
          <strong>Subnets</strong>
          <div>
            <Link href={`/subnet/${data.subnet_id}`}>
              <a className="link-overflow">{data.subnet_id}</a>
            </Link>
          </div>
        </div>
        <div>
          <strong>Nodes</strong>
          <ul>
            {data.node_ids.map((pid) => (
              <li key={pid}>
                <IdentifierLink type="principal" id={pid} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (proposal.action === Action["Reward Node Provider"]) {
    const data = JSON.parse(proposal.payloadJson);
    let account;
    if (data.reward_mode[0].RewardToAccount?.to_account[0]) {
      const buf = addCrc32(
        Buffer.from(data.reward_mode[0].RewardToAccount.to_account[0].hash)
      );
      account = buf.toString("hex");
    }
    return (
      <div className="flex flex-col gap-2 text-xs">
        <div>
          <strong>Node Provider</strong>
          <ul>
            {data.node_provider.map(({ id }) => (
              <li key={id}>
                <IdentifierLink type="principal" id={id} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Account</strong>
          <div>
            {account ? <IdentifierLink type="account" id={account} /> : "-"}
          </div>
        </div>
        <div>
          <strong>Amount</strong>
          <div>
            {data.amount_e8s ? <BalanceLabel value={data.amount_e8s} /> : "-"}
          </div>
        </div>
      </div>
    );
  }

  if (proposal.nnsFunction === NnsFunction["Remove Nodes From Registry"]) {
    let buf;
    try {
      buf = Buffer.from(proposal.payloadJson.split(",").map(Number));
      const { outputs } = decodeBlob(buf);
      if (outputs[0]._4257184827_) {
        return (
          <div className="text-xs">
            <strong>Nodes</strong>
            <ul>
              {outputs[0]._4257184827_.map((principal) => {
                const pid = principal.toText();
                return (
                  <li key={pid}>
                    <IdentifierLink type="principal" id={pid} />
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }
    } catch (error) {
      console.warn(error.message);
    }
    if (buf) {
      return <pre className="mb-1 text-xs">{buf.toString("hex")}</pre>;
    }
  }

  return <pre className="mb-1 text-xs">{proposal.payloadJson}</pre>;
};
