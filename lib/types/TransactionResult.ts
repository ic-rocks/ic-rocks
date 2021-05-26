export type TransactionType = "TRANSACTION" | "FEE" | "MINT" | "BURN";

export type TransactionResult = {
  transactions: {
    block_identifier: {
      index: number;
      hash: string;
    };
    transaction: {
      transaction_identifier: {
        hash: string;
      };
      operations: {
        operation_identifier: {
          index: number;
        };
        type: TransactionType;
        status: "COMPLETED";
        account: {
          address: string;
        };
        amount: {
          value: string;
          currency: {
            symbol: string;
            decimals: number;
          };
        };
      }[];
      metadata: {
        block_height: number;
        memo: number;
        timestamp: number;
      };
    };
  }[];
  total_count: number;
};
