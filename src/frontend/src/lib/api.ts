const API_BASE = "http://localhost:3001";

// Types are duplicated from backend since they live in separate package contexts.
// For a project this size, shared types via a monorepo package would be overkill.

export interface Transaction {
	transactionDate: string;
	accountNumber: string;
	accountHolderName: string;
	amount: number;
	status: "Pending" | "Settled" | "Failed";
}

export interface TransactionInput {
	transactionDate: string;
	accountNumber: string;
	accountHolderName: string;
	amount: number;
}

export class ApiError extends Error {
	status: number;
	details?: Record<string, string[]>;

	constructor(
		message: string,
		status: number,
		details?: Record<string, string[]>,
	) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.details = details;
	}
}

async function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new ApiError(
			body.error || `HTTP ${res.status}`,
			res.status,
			body.details,
		);
	}
	return res.json();
}

export async function getTransactions(): Promise<Transaction[]> {
	const res = await fetch(`${API_BASE}/transactions`);
	return handleResponse<Transaction[]>(res);
}

export async function postTransaction(
	input: TransactionInput,
): Promise<Transaction> {
	const res = await fetch(`${API_BASE}/transactions`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	return handleResponse<Transaction>(res);
}
