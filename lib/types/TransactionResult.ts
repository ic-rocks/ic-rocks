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
        type: string;
        status: string;
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
