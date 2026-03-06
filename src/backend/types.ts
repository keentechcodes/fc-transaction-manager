export interface Transaction {
  transactionDate: string;
  accountNumber: string;
  accountHolderName: string;
  amount: number;
  status: "Pending" | "Settled" | "Failed";
}

export type TransactionInput = Omit<Transaction, "status">;

export const VALID_STATUSES = ["Pending", "Settled", "Failed"] as const;
