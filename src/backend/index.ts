import { createTransaction, getTransactions } from "./handlers/transactions";
import { ensureFileExists } from "./storage";

try {
	await ensureFileExists();
	console.log("Storage initialized");
} catch (error) {
	console.error("Failed to initialize storage:", error);
	process.exit(1);
}

const CORS_HEADERS: Record<string, string> = {
	"Access-Control-Allow-Origin": "http://localhost:5173",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

function withCors(res: Response): Response {
	const headers = new Headers(res.headers);
	for (const [key, value] of Object.entries(CORS_HEADERS)) {
		headers.set(key, value);
	}
	return new Response(res.body, {
		status: res.status,
		statusText: res.statusText,
		headers,
	});
}

const server = Bun.serve({
	port: 3001,

	async fetch(req) {
		const url = new URL(req.url);
		const { pathname } = url;
		const method = req.method;

		if (method === "OPTIONS") {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}

		if (pathname === "/transactions") {
			if (method === "GET") return withCors(await getTransactions());
			if (method === "POST") return withCors(await createTransaction(req));
			return withCors(
				Response.json({ error: "Method not allowed" }, { status: 405 }),
			);
		}

		return withCors(Response.json({ error: "Not found" }, { status: 404 }));
	},

	error(error) {
		console.error("Unhandled server error:", error);
		return withCors(
			Response.json({ error: "Internal server error" }, { status: 500 }),
		);
	},
});

console.log(`API running at http://localhost:${server.port}`);
