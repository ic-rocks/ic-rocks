const fs = require("fs");
const path = require("path");
const { Actor, HttpAgent } = require("@dfinity/agent");
const { IDL } = require("@dfinity/candid");
const { Principal } = require("@dfinity/principal");
const extendProtobuf = require("agent-pb").default;
const protobuf = require("protobufjs");
const protobufJson = require("../lib/canisters/proto.json");
const fetch = require("node-fetch");
global.fetch = fetch;

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
  const sortedSubnetsList = record.subnets
    .map((subnet) => Principal.fromUint8Array(subnet).toText())
    .sort();
  console.log(
    "version:",
    subnetListValue.version.toString(),
    "subnets:",
    sortedSubnetsList.length
  );

  const sortedSubnetsEntries = await Promise.all(
    sortedSubnetsList.map(async (subnet) => {
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
            Principal.fromUint8Array(Buffer.from(nodeId, "base64")).toText()
          ),
          version: version.toString(),
        },
      ];
    })
  );

  const sortedNodesEntries = (
    await Promise.all(
      sortedSubnetsEntries.flatMap(([subnet, record]) => {
        return record.membership.map(async (nodeId) => {
          const nodeValue = await registry.get_value({
            key: Buffer.from("node_record_" + nodeId),
          });
          const nodeRecord = root
            .lookupType("NodeRecord")
            .decode(nodeValue.value)
            .toJSON();
          const nodeOperatorId = Principal.fromUint8Array(
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
            nodeOperatorPrincipalId: Principal.fromUint8Array(
              Buffer.from(nodeOperatorRecord.nodeOperatorPrincipalId, "base64")
            ).toText(),
            nodeProviderPrincipalId: Principal.fromUint8Array(
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
    )
  ).sort(([a], [b]) => (a > b ? 1 : -1));
  console.log("nodes:", sortedNodesEntries.length);

  const nodesFullMap = Object.fromEntries(sortedNodesEntries);
  const subnetsJson = {
    version: subnetListValue.version.toString(),
    subnets: Object.fromEntries(sortedSubnetsEntries),
    nodes: nodesFullMap,
  };

  const subnetsJsonFilename = path.resolve(
    `${__dirname}/../generated/subnets.json`
  );
  fs.writeFileSync(subnetsJsonFilename, JSON.stringify(subnetsJson));
  console.log("wrote subnets to", subnetsJsonFilename);

  // const locations = await fetch('https://ic-api.internetcomputer.org/api/locations').then(res => res.json())

  const principalsMap = sortedNodesEntries.reduce(
    (acc, [nodeId, record], idx) => {
      const keyOp = record.nodeOperator.value.nodeOperatorPrincipalId;
      if (!acc[keyOp]) {
        acc[keyOp] = {};
      }
      if (!acc[keyOp].operator) {
        acc[keyOp].operator = [];
      }
      acc[keyOp].operator.push(idx);

      const keyPr = record.nodeOperator.value.nodeProviderPrincipalId;
      if (!acc[keyPr]) {
        acc[keyPr] = {};
      }
      if (!acc[keyPr].provider) {
        acc[keyPr].provider = [];
      }
      acc[keyPr].provider.push(idx);
      return acc;
    },
    {}
  );
  const sortedPrincipals = Object.keys(principalsMap).sort();

  console.log(
    "unique principals:",
    sortedPrincipals.length,
    "operators:",
    Object.values(principalsMap).filter((p) => !!p.operator).length,
    "providers:",
    Object.values(principalsMap).filter((p) => !!p.provider).length
  );

  const nodesMap = sortedSubnetsEntries.reduce(
    (acc, [subnetId, record], idx) => {
      return {
        ...acc,
        ...Object.fromEntries(
          record.membership.map((nodeId) => {
            const provider = sortedPrincipals.findIndex(
              (p) =>
                p ===
                nodesFullMap[nodeId].nodeOperator.value.nodeProviderPrincipalId
            );
            const operator = sortedPrincipals.findIndex(
              (p) =>
                p ===
                nodesFullMap[nodeId].nodeOperator.value.nodeOperatorPrincipalId
            );

            return [
              nodeId,
              {
                subnet: idx,
                provider,
                operator,
              },
            ];
          })
        ),
      };
    },
    {}
  );

  const nodesJson = {
    nodesList: sortedNodesEntries.map(([nodeId]) => nodeId),
    subnetsList: sortedSubnetsEntries.map(([subnetId]) => subnetId),
    principalsList: sortedPrincipals,
    nodesMap,
    principalsMap,
  };
  const principalsFilename = path.resolve(
    `${__dirname}/../public/data/generated/nodes.json`
  );
  fs.writeFileSync(principalsFilename, JSON.stringify(nodesJson));
  console.log("wrote node principals to", principalsFilename);
}

syncSystemData();
