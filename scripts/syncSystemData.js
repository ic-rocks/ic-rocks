const fs = require("fs");
const path = require("path");
const { Actor, HttpAgent, IDL, Principal } = require("@dfinity/agent");
const extendProtobuf = require("agent-pb").default;
const protobuf = require("protobufjs");
const protobufJson = require("../lib/canisters/proto.json");
global.fetch = require("node-fetch");

const root = protobuf.Root.fromJSON(protobufJson);
const agent = new HttpAgent({ host: "https://ic0.app" });
const registry = Actor.createActor(() => IDL.Service({}), {
  agent,
  canisterId: "rwlgt-iiaaa-aaaaa-aaaaa-cai",
});
extendProtobuf(registry, root.lookupService("Registry"));

async function syncSystemData() {
  console.log("reading system data from registry...");
  const subnetListValue = await registry.get_value({
    key: Buffer.from("subnet_list"),
  });
  const record = root
    .lookupType("SubnetListRecord")
    .decode(subnetListValue.value);
  const subnets = record.subnets.map((subnet) =>
    Principal.fromBlob(subnet).toText()
  );
  console.log(
    "version:",
    subnetListValue.version.toString(),
    "subnets:",
    subnets.length
  );

  const subnetEntries = await Promise.all(
    subnets.map(async (subnet) => {
      const { version, value } = await registry.get_value({
        key: Buffer.from("subnet_record_" + subnet),
      });
      const subnetRecord = root
        .lookupType("SubnetRecord")
        .decode(value)
        .toJSON();
      return [
        subnet,
        {
          ...subnetRecord,
          membership: subnetRecord.membership.map((nodeId) =>
            Principal.fromBlob(Buffer.from(nodeId, "base64")).toText()
          ),
          version: version.toString(),
        },
      ];
    })
  );

  const nodesEntries = await Promise.all(
    subnetEntries.flatMap(([subnet, record]) => {
      return record.membership.map(async (nodeId) => {
        const nodeValue = await registry.get_value({
          key: Buffer.from("node_record_" + nodeId),
        });
        const nodeRecord = root
          .lookupType("NodeRecord")
          .decode(nodeValue.value)
          .toJSON();
        const nodeOperatorId = Principal.fromBlob(
          Buffer.from(nodeRecord.nodeOperatorId, "base64")
        ).toText();

        const nodeOperatorValue = await registry.get_value({
          key: Buffer.from("node_operator_record_" + nodeOperatorId),
        });
        const nodeOperatorRecord = root
          .lookupType("NodeOperatorRecord")
          .decode(nodeOperatorValue.value)
          .toJSON();
        const nodeOperator = {
          ...nodeOperatorRecord,
          nodeOperatorPrincipalId: Principal.fromBlob(
            Buffer.from(nodeOperatorRecord.nodeOperatorPrincipalId, "base64")
          ).toText(),
          nodeProviderPrincipalId: Principal.fromBlob(
            Buffer.from(nodeOperatorRecord.nodeProviderPrincipalId, "base64")
          ).toText(),
        };
        if (nodeOperatorId !== nodeOperator.nodeOperatorPrincipalId) {
          console.warn(
            "node record has operator",
            nodeOperatorId,
            "but operator record is",
            nodeOperator.nodeOperatorPrincipalId
          );
        }

        return [
          nodeId,
          {
            // node: { version: nodeValue.version.toString(), value: node },
            nodeOperator: {
              version: nodeOperatorValue.version.toString(),
              value: nodeOperator,
            },
          },
        ];
      });
    })
  );
  console.log("nodes:", nodesEntries.length);

  const subnetsJson = {
    version: subnetListValue.version.toString(),
    subnets: Object.fromEntries(subnetEntries),
    nodes: Object.fromEntries(nodesEntries),
  };

  const subnetsJsonFilename = path.resolve(
    `${__dirname}/../generated/subnets.json`
  );
  fs.writeFileSync(subnetsJsonFilename, JSON.stringify(subnetsJson));
  console.log("wrote subnets to", subnetsJsonFilename);

  const nodesOperatorMap = nodesEntries.reduce((acc, [nodeId, record]) => {
    const key = record.nodeOperator.value.nodeOperatorPrincipalId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(nodeId);
    return acc;
  }, {});
  const nodeProviderMap = nodesEntries.reduce((acc, [nodeId, record]) => {
    const key = record.nodeOperator.value.nodeProviderPrincipalId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(nodeId);
    return acc;
  }, {});
  console.log(
    "operators:",
    Object.keys(nodesOperatorMap).length,
    "providers:",
    Object.keys(nodeProviderMap).length
  );

  const nodePrincipalsJson = {
    nodesOperator: nodesOperatorMap,
    nodeProvider: nodeProviderMap,
  };
  const principalsFilename = path.resolve(
    `${__dirname}/../public/data/generated/principals.json`
  );
  fs.writeFileSync(principalsFilename, JSON.stringify(nodePrincipalsJson));
  console.log("wrote node principals to", principalsFilename);
}

syncSystemData();
