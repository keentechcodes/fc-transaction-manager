import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Transaction } from "@/lib/api";

const STATUS_CLASSES: Record<Transaction["status"], string> = {
	Settled: "bg-green-100 text-green-800 hover:bg-green-100",
	Pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
	Failed: "bg-red-100 text-red-800 hover:bg-red-100",
};

function formatAmount(amount: number): string {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

interface TransactionTableProps {
	transactions: Transaction[];
	isLoading: boolean;
	error: Error | null;
}

export function TransactionTable({
	transactions,
	isLoading,
	error,
}: TransactionTableProps) {
	if (isLoading) {
		return (
			<p className="py-8 text-center text-muted-foreground">
				Loading transactions...
			</p>
		);
	}

	if (error) {
		return (
			<p className="py-8 text-center text-red-600">
				Failed to load transactions: {error.message}
			</p>
		);
	}

	if (transactions.length === 0) {
		return (
			<p className="py-8 text-center text-muted-foreground">
				No transactions found.
			</p>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Date</TableHead>
					<TableHead>Account Number</TableHead>
					<TableHead>Account Holder</TableHead>
					<TableHead className="text-right">Amount</TableHead>
					<TableHead>Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{transactions.map((tx, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: CSV rows have no unique ID, index is a tiebreaker
					<TableRow key={`${tx.accountNumber}-${tx.transactionDate}-${index}`}>
						<TableCell>{tx.transactionDate}</TableCell>
						<TableCell>{tx.accountNumber}</TableCell>
						<TableCell>{tx.accountHolderName}</TableCell>
						<TableCell className="text-right">
							{formatAmount(tx.amount)}
						</TableCell>
						<TableCell>
							<Badge variant="outline" className={STATUS_CLASSES[tx.status]}>
								{tx.status}
							</Badge>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
