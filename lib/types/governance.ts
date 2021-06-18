export enum ErrorType {
  "Unspecified" = 0,
  "Ok" = 1,
  "Unavailable" = 2,
  "Not Authorized" = 3,
  "Not Found" = 4,
  "Invalid Command" = 5,
  "Requires Locked" = 6,
  "Requires Dissolving" = 7,
  "Requires Dissolved" = 8,
  "Hot Key" = 9,
  "Resource Exhausted" = 10,
  "Precondition Failed" = 11,
  "External" = 12,
  "Ledger Update Ongoing" = 13,
  "Insufficient Funds" = 14,
  "Invalid Principal" = 15,
  "Invalid Proposal" = 16,
}

export enum Status {
  Unknown = 0,
  Open = 1,
  Rejected = 2,
  Adopted = 3,
  Executed = 4,
  Failed = 5,
}

export enum Topic {
  "Unspecified" = 0,
  "Neuron Management" = 1,
  "Exchange Rate" = 2,
  "Network Economics" = 3,
  "Governance" = 4,
  "Node Admin" = 5,
  "Participant Management" = 6,
  "Subnet Management" = 7,
  "Network Canister Management" = 8,
  "KYC" = 9,
  "Node Provider Rewards" = 10,
}

export enum RewardStatus {
  "Unknown" = 0,
  "Accept Votes" = 1,
  "Ready to Settle" = 2,
  "Settled" = 3,
  "Ineligible" = 4,
}

export enum Action {
  "Manage Neuron" = 10,
  "Network Economics" = 12,
  "Motion" = 13,
  "Execute NNS Function" = 14,
  "Approve Genesis KYC" = 15,
  "Add or Remove Node Provider" = 16,
  "Reward Node Provider" = 17,
  "Set Default Followees" = 18,
}

export enum NnsFunction {
  "Unspecified" = 0,
  "Create Subnet" = 1,
  "Add Node to Subnet" = 2,
  "NNS Canister Install" = 3,
  "NNS Canister Upgrade" = 4,
  "Bless Replica Version" = 5,
  "Recover Subnet" = 6,
  "Update Config of Subnet" = 7,
  "Assign NOID" = 8,
  "NNS Root Upgrade" = 9,
  "ICP XDR Conversion Rate" = 10,
  "Update Subnet Replica Version" = 11,
  "Clear Provisional Whitelist" = 12,
  "Remove Nodes from Subnet" = 13,
  "Set Authorized Subnetworks" = 14,
  "Set Firewall Config" = 15,
  "Update Node Operator Config" = 16,
  "Stop or Start NNS Canister" = 17,
}
