import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { TransactionTable } from "@/components/TransactionTable";
import { useTransactions } from "@/hooks/useTransactions";

const queryClient = new QueryClient();

function Dashboard() {
	const { data, isLoading, error } = useTransactions();

	return (
		<div className="mx-auto max-w-4xl p-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Transaction Management System</h1>
				<AddTransactionModal />
			</div>
			<TransactionTable
				transactions={data ?? []}
				isLoading={isLoading}
				error={error}
			/>
		</div>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Dashboard />
		</QueryClientProvider>
	);
}

export default App;
