import { mkdirSync } from "node:fs";
import { appendFile } from "node:fs/promises";
import { Mutex } from "async-mutex";
import Papa from "papaparse";
import type { Transaction, TransactionInput } from "./types";
import { VALID_STATUSES } from "./types";

const CSV_PATH = "./data/transactions.csv";
const CSV_HEADERS =
	"Transaction Date,Account Number,Account Holder Name,Amount,Status";

const writeMutex = new Mutex();

function randomStatus(): Transaction["status"] {
	const index = Math.floor(Math.random() * VALID_STATUSES.length);
	const status = VALID_STATUSES[index];
	if (!status) throw new Error("Invalid status index");
	return status;
}

function ensureFileExists(): void {
	mkdirSync("./data", { recursive: true });
	const file = Bun.file(CSV_PATH);
	if (!file.size) {
		Bun.write(CSV_PATH, `${CSV_HEADERS}\r\n`);
	}
}

export async function readTransactions(): Promise<Transaction[]> {
	ensureFileExists();

	const csvString = await Bun.file(CSV_PATH).text();
	const result = Papa.parse<Record<string, string>>(csvString, {
		header: true,
		skipEmptyLines: true,
		dynamicTyping: false,
	});

	const fatalErrors = result.errors.filter((e) => e.type !== "FieldMismatch");
	if (fatalErrors.length > 0) {
		throw new Error(`CSV parse errors: ${JSON.stringify(fatalErrors)}`);
	}

	return result.data
		.map((row) => ({
			transactionDate: row["Transaction Date"] ?? "",
			accountNumber: row["Account Number"] ?? "",
			accountHolderName: row["Account Holder Name"] ?? "",
			amount: parseFloat(row["Amount"] ?? "0"),
			status: row["Status"] as Transaction["status"],
		}))
		.filter((tx) => {
			if (Number.isNaN(tx.amount)) return false;
			if (!VALID_STATUSES.includes(tx.status)) return false;
			return true;
		});
}

export async function writeTransaction(
	input: TransactionInput,
): Promise<Transaction> {
	const tx: Transaction = { ...input, status: randomStatus() };
	const release = await writeMutex.acquire();
	try {
		ensureFileExists();

		const csvRow = Papa.unparse(
			[
				[
					tx.transactionDate,
					tx.accountNumber,
					tx.accountHolderName,
					tx.amount,
					tx.status,
				],
			],
			{ header: false, newline: "\r\n" },
		);

		await appendFile(CSV_PATH, `${csvRow}\r\n`);
	} finally {
		release();
	}

	return tx;
}
