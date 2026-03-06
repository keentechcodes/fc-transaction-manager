# Transaction Management System

A full-stack transaction management system built for the First Circle technical assessment. API + web interface for viewing and adding transactions, backed by a CSV file.

## Tech Stack

| Component      | Choice                  | Why                                                                                              |
| -------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| **Runtime**    | Bun (v1.2+)             | Native TypeScript, fast file I/O, no separate build step for the backend.                        |
| **API**        | Native `Bun.serve`      | Two endpoints don't need a framework. Uses a `fetch` handler with `withCors()` for clean routing.|
| **CSV**        | PapaParse               | RFC 4180 compliant. Handles quoted fields, commas in names correctly.                            |
| **Validation** | Zod v3                  | Schema validation at the API boundary. Malformed data never reaches the CSV.                     |
| **Frontend**   | React + Vite            | Fast dev server, HMR, standard tooling.                                                         |
| **State**      | TanStack Query v5       | Handles fetching, caching, and cache invalidation without manual `useEffect` + `fetch` wiring.  |
| **UI**         | shadcn/ui (Radix-based) | Accessible components (keyboard nav, screen readers) that live in the source, fully editable.    |

## Prerequisites

- **Bun** v1.2 or higher

```bash
curl -fsSL https://bun.sh/install | bash
```

That's it. No separate Node.js, npm, or database setup needed.

## Getting Started

```bash
git clone <repo-url>
cd fc-transaction-manager

# Install all dependencies
bun install
cd src/frontend && bun install && cd ../..

# Start both API and frontend
bun run dev
```

| Service      | URL                   |
| ------------ | --------------------- |
| **Frontend** | http://localhost:5173  |
| **API**      | http://localhost:3001  |

## Project Structure

```
├── src/
│   ├── backend/
│   │   ├── index.ts               # Bun.serve entry point with CORS
│   │   ├── handlers/
│   │   │   └── transactions.ts    # GET + POST request handlers
│   │   ├── storage.ts             # CSV read/write with write mutex
│   │   ├── schema.ts              # Zod validation schemas
│   │   └── types.ts               # Transaction types and constants
│   └── frontend/
│       └── src/
│           ├── components/
│           │   ├── ui/            # shadcn/ui primitives (Table, Dialog, Badge, etc.)
│           │   ├── TransactionTable.tsx
│           │   └── AddTransactionModal.tsx
│           ├── hooks/
│           │   └── useTransactions.ts
│           ├── lib/
│           │   ├── api.ts         # API client with structured error handling
│           │   └── utils.ts       # shadcn cn() helper
│           ├── App.tsx
│           └── main.tsx
├── data/
│   └── transactions.csv           # Data file (seeded with 12 sample rows)
├── package.json
├── biome.json
└── tsconfig.json
```

## API

### `GET /transactions`

Returns all transactions from the CSV file.

**Response** `200 OK`
```json
[
  {
    "transactionDate": "2025-03-01",
    "accountNumber": "7289-3445-1121",
    "accountHolderName": "Maria Johnson",
    "amount": 150.00,
    "status": "Settled"
  }
]
```

### `POST /transactions`

Adds a new transaction. Status is randomly assigned by the server.

**Request body:**
```json
{
  "transactionDate": "2025-03-11",
  "accountNumber": "1234-5678-9012",
  "accountHolderName": "Ana Santos",
  "amount": 250.00
}
```

**Validation rules (Zod):**
- `transactionDate` - valid `YYYY-MM-DD`, rejects invalid calendar dates (e.g. 2025-02-30)
- `accountNumber` - must match `XXXX-XXXX-XXXX` format (digits only)
- `accountHolderName` - required, non-empty string
- `amount` - required, positive number

**Response** `201 Created`
```json
{
  "transactionDate": "2025-03-11",
  "accountNumber": "1234-5678-9012",
  "accountHolderName": "Ana Santos",
  "amount": 250.00,
  "status": "Pending"
}
```

**Error responses:**
- `400` - Validation failed: `{ "error": "Validation failed", "details": { ... } }`
- `500` - Write failed: `{ "error": "Failed to save transaction", "details": "..." }`

## Testing

```bash
# Get all transactions
curl http://localhost:3001/transactions

# Add a new transaction
curl -X POST http://localhost:3001/transactions \
  -H "Content-Type: application/json" \
  -d '{"transactionDate":"2025-03-11","accountNumber":"1111-2222-3333","accountHolderName":"Test User","amount":100.00}'

# Test validation (should return 400)
curl -X POST http://localhost:3001/transactions \
  -H "Content-Type: application/json" \
  -d '{"transactionDate":"not-a-date","amount":-5}'
```

## Error Handling

Errors are handled at three layers:

1. **API boundary (Zod)** - Rejects malformed POST bodies before they reach the storage layer. Returns `400` with field-level errors so the frontend can display them inline.

2. **Storage layer** - Creates the CSV file with headers if it doesn't exist. PapaParse errors are checked after every parse. Rows with invalid data (NaN amounts, bad statuses) are filtered out rather than crashing.

3. **Frontend** - TanStack Query's `isError` state drives error UI. The table shows a message if the GET fails. The modal surfaces field-level validation errors from `400` responses and shows a generic message for `500`s.

## Architecture Decisions

**Why PapaParse instead of manual CSV parsing?**
Financial data has edge cases like account holder names with commas, quoted fields, and special characters. PapaParse handles RFC 4180 compliance so we don't have to.

**Why server-assigned status?**
The spec says to randomly assign one of three statuses. Doing this server-side prevents client-side manipulation and keeps the CSV as the single source of truth.

**Why TanStack Query instead of local state?**
After a POST, we invalidate the `["transactions"]` query key. This triggers a background refetch so the table updates with fresh data. No manual state synchronization needed.

**Why `fetch` handler over Bun's `routes` object?**
Bun's `routes` doesn't support middleware yet. Using `fetch` with a `withCors()` helper keeps CORS handling in one place and makes adding routes straightforward.

**Concurrent write safety:**
Writes are serialized through a promise chain (in-memory mutex). This prevents interleaved CSV appends from simultaneous POST requests.

## Known Limitations

- No authentication or rate limiting
- CORS origin is hardcoded to `localhost:5173`
- For production, swap CSV for a database, add request logging, and make CORS origin configurable
