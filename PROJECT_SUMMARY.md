# PowerLink — Frontend Summary and Backend Kick‑off Brief

This document summarizes the current state of the PowerLink frontend, the features implemented so far, key files and decisions, and a concrete backend specification you can hand to ChatGPT (or any engineer) to generate a server.

Use this as a single source of truth to bootstrap the backend.

---

## Repository layout

- `client/` (Vite + React)
  - `src/components/`
    - `Navbar.jsx` — top bar with profile dropdown (click to open/close; arrow rotates; outside/Esc closes)
    - `Sidebar.jsx` — navigation
    - `ui/` — reusable UI components (`Button`, `Card`, `DatePicker`, `DateRangePicker`, `SortSelect`)
  - `src/pages/`
    - `Dashboard.jsx` — snapshot and KPIs; banner controls removed (date, compare, print)
    - `Workers.jsx` — searchable/sortable/paginatable table with CSV export
    - `Baana.jsx` — date-range filter + CSV export
    - `Beam.jsx` — date-range filter + CSV export
    - `Calendar.jsx` — functional month view with events (Baana, Beam, Installments)
    - Plus forms/pages: `AddWorker`, `AddLoan`, `PayInstallment`, `Expenses`, etc.
  - `src/data/` — in-memory seed data for demo (`workers.js`, `loans.js`, `installments.js`, `expenses.js`, `baana.js`, `beam.js`)
  - `src/utils/`
    - `date.js` — date formatting helpers
    - `export.js` — `downloadCSV({ filename, columns, rows })`

Build system: Vite. No global state library (simple local state and effects).

---

## Features implemented (UI)

- Navbar
  - Profile dropdown opens on arrow click only; arrow rotates up when open; closes on outside click or Esc.
- Workers
  - Search by name, date-range filter (joining date), multi-column sort, pagination (client-side), CSV export (respects current filters and formatting for dates).
- Baana & Beam
  - Date-range filtering, sorting, pagination (client-side), CSV export (formatted dates).
- Calendar
  - Real month grid (6 weeks), Prev/Next navigation, today highlight.
  - Events displayed from demo data: Baana (teal), Beam (cyan), Installments (amber). Shows "+N more" for crowded days.
- Dashboard
  - “Select date range / Compare / Print Snapshot” controls removed per request.

---

## Notable UI decisions

- Filtering/sorting/pagination performed client-side for now; designed to map 1:1 to server-side later.
- CSV export is done fully on the client (utility in `utils/export.js`) and takes the filtered rows to ensure WYSIWYG export.
- Calendar builds an events map from seed data and renders tags in cells; designed to swap to a `/calendar` API easily.

---

## Key file references

- `src/components/Navbar.jsx` — dropdown logic and arrow rotation state.
- `src/pages/Workers.jsx` — example of filter + sort + export pattern.
- `src/pages/Baana.jsx`, `src/pages/Beam.jsx` — export added, date-range filtering.
- `src/pages/Calendar.jsx` — month matrix generation, events aggregation from demo data.
- `src/utils/export.js` — CSV download helper.

---

## How to run/build (local)

```powershell
# From repo root
cd client
npm install
npm run dev   # Start Vite dev server
# Optional: build
npm run build
```

---

## Backend MVP specification (proposed)

Goal: Replace in-memory data with a persistent API, enabling multi-user access, server-side filtering/sorting/pagination, and secure imports/exports.

### Stack (suggested)

- Node.js + Express + TypeScript
- Database: PostgreSQL (SQLite for dev) via Prisma ORM
- Validation: zod
- Auth: JWT (access/refresh), bcrypt for password hashing
- Middleware: CORS, Helmet, compression, pino logging, dotenv
- Tests: Vitest/Jest + supertest

Alternative: Supabase (Postgres + row-level security + auth) if you want managed.

### Data model

- User: id, email, name, role (admin|manager|viewer), passwordHash, createdAt
- Worker: id, name, phone (unique), address, joiningDate
- Loan: id, workerId FK, amount, loanDate, notes
- Installment: id, loanId FK, date, amount, method?, notes?
- Expense: id, date, category, amount, notes?
- Baana: id, date, sacks, notes?
- Beam: id, date, bunches, notes?
- AuditLog: id, actorId, action, entityType, entityId, before, after, createdAt

Derived fields (frontend expectation):
- Remaining loan per worker = sum(loans) - sum(installments for that worker’s loans).
- Status flags (optional): Active, Overdue, Cleared.

### API design

Common query params: `page`, `pageSize`, `sortBy`, `sortDir`, `q`, `from`, `to`.

Common response shape:
```json
{
  "data": [ /* rows */ ],
  "meta": { "page": 1, "pageSize": 25, "total": 123 }
}
```

Endpoints (MVP):
- Auth
  - POST `/auth/login` { email, password }
  - GET `/auth/me` (requires access token)
  - POST `/auth/refresh`
- Workers
  - GET `/workers`
  - POST `/workers`
  - GET `/workers/:id`
  - PUT `/workers/:id`
  - DELETE `/workers/:id`
- Loans, Installments, Expenses, Baana, Beam — same CRUD with filtering/sort.
- Dashboard stats
  - GET `/stats/dashboard?from=&to=` — totals and KPIs needed by `Dashboard.jsx`.
- Calendar
  - GET `/calendar?month=&year=` — return events array: `{ date: 'YYYY-MM-DD', label, type }`.
- Export
  - GET `/export/workers.csv?from=&to=&sortBy=&sortDir=&q=` — CSV or XLSX stream; same for baana/beam/etc.
- Import (optional stage 2)
  - POST `/import/workers` — CSV upload, with a dry-run preview mode.

### Auth and roles

- Roles: Admin (full), Manager (no user management), Viewer (read-only).
- Protect POST/PUT/DELETE routes; log to `AuditLog` with before/after snapshots.

### Error format

```json
{ "error": { "message": "...", "code": "VALIDATION_ERROR", "details": {} } }
```

### Performance

- Server-side pagination + indexes on date columns and foreign keys.
- Streamed CSV exports.
- Background jobs for reminders/backups later.

---

## Frontend ↔ API mapping

- Workers.jsx
  - Replace seed data with `GET /workers` using `q`, `from`, `to`, `sortBy`, `sortDir`, `page`, `pageSize`.
  - Export button calls server `/export/workers.csv` (or keep client-side initially).
- Baana.jsx / Beam.jsx
  - Use `GET /baana` / `GET /beam` with `from/to`. Export via `/export/baana.csv` and `/export/beam.csv`.
- Calendar.jsx
  - Replace local aggregation with `GET /calendar?month=&year=`.
- Dashboard.jsx
  - Replace local KPIs with `GET /stats/dashboard`.

---

## Migration plan (incremental)

1) Scaffold `server/` with Express + Prisma; define schema for the models above. Seed DB from `client/src/data/*.js`.
2) Implement read-only list endpoints for Workers/Baana/Beam with pagination and filters.
3) Wire frontend lists to those endpoints using a small fetch client (and optionally React Query). Add loading/empty/error states.
4) Add create/update endpoints and connect form pages (AddWorker/AddLoan/PayInstallment/Expense).
5) Implement exports on the server (CSV first, XLSX optional) that honor filters.
6) Add `/stats/dashboard` and `/calendar` aggregations.
7) Add auth + roles + audit log; guard mutating routes.

---

## Example contracts

Workers list request:
```
GET /workers?page=1&pageSize=10&sortBy=name&sortDir=asc&q=ali&from=2025-01-01&to=2025-12-31
```
Response:
```json
{
  "data": [
    {
      "id": "W-001",
      "name": "Aamir Khan",
      "phone": "0300-1111111",
      "address": "Korangi, Karachi",
      "joiningDate": "2024-04-12",
      "totalLoan": 50000,
      "remainingLoan": 32000
    }
  ],
  "meta": { "page": 1, "pageSize": 10, "total": 37 }
}
```

Calendar request:
```
GET /calendar?month=9&year=2025
```
Response:
```json
{
  "data": [
    { "date": "2025-09-03", "label": "12 sacks (Baana)", "type": "baana" },
    { "date": "2025-09-05", "label": "8 bunches (Beam)", "type": "beam" },
    { "date": "2025-09-10", "label": "Installment: 5,000", "type": "installment" }
  ]
}
```

---

## Prompt you can give to ChatGPT to generate the backend

> I have a Vite + React app called PowerLink. Use the spec below to scaffold a backend with Node.js, Express, TypeScript, and Prisma (Postgres). Create a `server/` folder with a runnable project, Prisma schema, migrations, seed scripts from the sample JSON structure I’ll provide, and REST endpoints. Include basic JWT auth (roles: admin, manager, viewer), server-side pagination/filtering/sorting, and CSV export endpoints that honor filters. Provide code and a README with run commands.
>
> Context to respect:
> - Frontend pages and their expected data are described below.
> - Query params: `page`, `pageSize`, `sortBy`, `sortDir`, `q`, `from`, `to`.
> - Response shape: `{ data, meta: { page, pageSize, total } }`.
> - Endpoints to implement first: `/workers`, `/baana`, `/beam`, `/stats/dashboard`, `/calendar`, `/export/*.csv`.
> - Data model: Users, Workers, Loans, Installments, Expenses, Baana, Beam, AuditLog.
> - Security: protect POST/PUT/DELETE with role checks; log mutations to AuditLog.
> - Bonus: add a dry‑run `/import/workers` that validates and previews.
>
> Deliverables:
> - `server/` with package.json, tsconfig, ESLint config, Express app, routes, Prisma schema, migrations, seed, and tests for 1–2 endpoints.
> - README with `.env` template, run/build/test commands, and example curl calls.

---

## Next steps (if you want me to do it)

- I can scaffold `server/` with the stack above, seed from current `client/src/data/*.js`, and wire `Workers.jsx` to fetch from `GET /workers` as the first integration step. Let me know if you want Supabase instead of a custom server.
