import { transactionInputSchema } from "../schema";
import { readTransactions, writeTransaction } from "../storage";

export async function getTransactions(): Promise<Response> {
	try {
		const transactions = await readTransactions();
		return Response.json(transactions);
	} catch (error) {
		return Response.json(
			{ error: "Failed to read transactions", details: String(error) },
			{ status: 500 },
		);
	}
}

export async function createTransaction(req: Request): Promise<Response> {
	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const parsed = transactionInputSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{
				error: "Validation failed",
				details: parsed.error.flatten().fieldErrors,
			},
			{ status: 400 },
		);
	}

	try {
		const tx = await writeTransaction(parsed.data);
		console.log(tx);
		return Response.json(tx, { status: 201 });
	} catch (error) {
		return Response.json(
			{ error: "Failed to save transaction", details: String(error) },
			{ status: 500 },
		);
	}
}
