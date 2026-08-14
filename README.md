# buildpolaris_pwa

**The frontend for the BuildPolaris platform — an offline-first Progressive Web App.**

`buildpolaris_pwa` is a React + TypeScript + Vite single-page app. It talks to `buildpolaris_bff` over authenticated REST and is the only client BuildPolaris ships — office staff and field crews use the same app. It never talks to the AI sidecar directly; all AI traffic is proxied through `buildpolaris_bff`. For a deliberately narrow set of field-execution screens, it works fully offline by writing to a local database first and syncing when connectivity returns.

This document covers the project structure (folder hierarchy), what each part does, how to run the project, and the technologies/tools/libraries it needs to run correctly.

---

## 0. Related BuildPolaris repositories

BuildPolaris is three separate repositories that together make up one platform. Link the other two here:

- `buildpolaris_bff` (backend / system of record — Frappe on ERPNext v16): `[(https://github.com/mrhj26ali/buildpolaris_bff)`
- `buildpolaris_ai` (AI/RAG sidecar): `(https://github.com/mrhj26ali/buildpolaris_ai)`

---

## 1. Where this component sits in the platform

```
buildpolaris_pwa  (THIS REPO)
   │
   ├── local database (disposable) ─── the ONLY data source the UI ever reads from, online or offline
   │
   └── ──(REST, session cookie, idempotency key on replay)──▶  buildpolaris_bff
```

- `buildpolaris_bff` is always the arbiter, never this app. A queued offline write is re-validated against live permissions and business rules the moment it syncs — the local write succeeding is a UX affordance, not a business-rule decision.
- Only a handful of collections are writable offline: daily logs, JSAs, safety incidents, and punch list items (plus two read-only caches: task look-ahead and drawing-revision metadata). Everything else — financials, most of scheduling, communications — is a conventional online-only REST-backed feature.

## 2. Architecture style

**Feature-Sliced Design (FSD)** for UI/state organization + **local-first** architecture for the offline-capable slice.

- FSD maps each bounded context of the product onto its own `features/<name>/{ui, model, lib}` slice — independently ownable, testable, and removable.
- "Local-first," not "offline caching": a service-worker cache only helps *reads* survive disconnection. This app's local database gives it a real database with its own query engine, so field-execution components read from it **unconditionally** — online or offline is one code path, not an `if (online) fetch else cache` branch scattered through components. Sync status is just a field on the record, not a separate state machine the UI has to reconcile.
- **The two-file rule:** `lib/clients/bffClient.ts` and `lib/clients/aiClient.ts` are the only files in this codebase that know a backend origin URL. Every feature imports a typed client function, never `fetch` directly.
- **CPM in a Web Worker:** the same critical-path-method scheduling algorithm the backend runs authoritatively also runs client-side (against a shared golden test suite) for instant what-if feedback while dragging tasks in the Gantt view — isolated in a Web Worker so it never janks the main thread on large schedules.

## 3. Project structure (folder hierarchy)

```text
buildpolaris_pwa/
│
├── package.json, tsconfig.json, vite.config.ts, index.html
│
├── public/
│   ├── manifest.webmanifest, offline.html
│   └── icons/
│
├── src/
│   ├── main.tsx, App.tsx, router.tsx
│   │
│   ├── app/
│   │   ├── providers/          # Auth, Sync, Query (TanStack), ErrorBoundary
│   │   ├── layouts/            # AppShell, FieldLayout, OfficeLayout
│   │   └── routes/             # one route file per feature area
│   │
│   ├── features/               # one folder per bounded context — {ui, model, lib}
│   │   ├── field/               # OFFLINE-CAPABLE slice: daily logs, JSA, incidents, punch list
│   │   ├── financials/          # cost codes, commitments, pay applications, change events, EVM
│   │   ├── scheduling/          # Gantt, task drawer, what-if controls, critical-path highlight
│   │   ├── communications/      # RFIs, submittals, transmittals, meeting minutes, unified dashboard
│   │   ├── document_control/    # drawings, revisions, annotations
│   │   ├── closeout/            # closing record, lien waivers, closeout checklist/export
│   │   └── copilot/             # chat UI, citations, approval-request cards, AI-disclosure badge
│   │
│   ├── lib/
│   │   ├── clients/             # bffClient, aiClient (typed shapes only — see "two-file rule" above), httpClient, csrf
│   │   ├── auth/                # authStore, session, useAuth
│   │   ├── db/
│   │   │   ├── database.ts      # local database instance
│   │   │   ├── schemas/         # dailyLog, jsa, safetyIncident, punchListItem, tasksLookahead, drawingRevisionsMeta
│   │   │   └── repositories/    # typed CRUD per offline collection
│   │   ├── sync/                # SyncEngine, outbox, conflictResolver, syncStatus, idempotencyKey, reconnectListener
│   │   ├── workers/             # cpm.worker.ts
│   │   ├── cpm/                 # the client-side CPM algorithm (network, forward/backward pass, critical path)
│   │   ├── ui/                  # shared primitives — Button, Input, FormField, Toast, OfflineBanner, EmptyState
│   │   └── utils/                # date, currency, logger
│   │
│   ├── styles/
│   └── types/                   # api, domain, sync, copilot
```

**Why `field/` is structurally different from every other feature folder:** it's the only slice whose `model/` hooks read from the local database via `lib/db/repositories/` instead of from `lib/clients/bffClient.ts` directly. Adding a new offline-writable field outside the existing four collections is a scope decision, not a default to extend casually — it has real implications for conflict resolution and sync guarantees.

## 4. Technologies, tools & libraries

Taken directly from this project's `package.json`:

| Concern | Library |
|---|---|
| UI framework | React 19 |
| Language / build | TypeScript, Vite |
| Routing | React Router |
| Server state | TanStack Query (`@tanstack/react-query`), TanStack Virtual for long lists |
| Local-first database | **RxDB** (+ RxJS) — the local store the offline field-execution UI reads/writes unconditionally |
| Forms & validation | React Hook Form + `@hookform/resolvers` + **Zod** |
| Styling | Tailwind CSS v4, `class-variance-authority`, `tailwind-merge`, `tw-animate-css` |
| UI primitives | `radix-ui`, `shadcn`, `lucide-react` icons, Geist variable font |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` (punch-list board, kanban-style views) |
| i18n | `i18next` + `react-i18next` |
| Spreadsheet export | `xlsx` |
| PWA tooling | `vite-plugin-pwa`, `pwa-asset-generator` |
| Testing | Vitest (unit/integration/security/performance), Playwright (e2e), Testing Library, MSW (API mocking) |
| Lint / types | ESLint + `typescript-eslint` |

## 5. Prerequisites

- Node.js (LTS) and `npm`
- A running `buildpolaris_bff` instance to point at, or MSW-mocked API responses for isolated frontend development

## 6. Setup & installation

```bash
git clone <this-repo-url> buildpolaris_pwa
cd buildpolaris_pwa

npm install

# Point the app at your buildpolaris_bff site
cp .env.example .env    # if present — otherwise set VITE_BFF_BASE_URL directly
```

## 7. Running the app

```bash
npm run dev              # local dev server (Vite)
npm run build             # type-check (tsc -b) + production build
npm run preview           # preview the production build locally
```


## 8. No large pretrained models or bulk training data

This repository contains no pretrained models, embeddings, or bulk datasets — it's a frontend application (TypeScript/React source) only. Model/embedding assets used by the platform live in and are documented by `buildpolaris_ai`.
