import { z } from "zod";

export const transactionInputSchema = z.object({
  transactionDate: z
    .string()
    .date("Must be in YYYY-MM-DD format")
    .refine((value) => {
      const d = new Date(value + "T00:00:00Z");
      return d.toISOString().slice(0, 10) === value;
    }, "Must be a valid calendar date"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountHolderName: z.string().min(1, "Account holder name is required"),
  amount: z.number().positive("Amount must be a positive number"),
});
