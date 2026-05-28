# Feature Inventory

Based on source analysis of `src/` directory. Features grouped by architectural boundary, not UI granularity.

## Feature Boundaries

### 1. Webhook Ingestion

**Entry points:**
- `src/index.ts:309` — `handleWebhook()`

**Core files:**
- `src/index.ts` (lines 282-387)
- `src/types.ts` (validation logic, lines 178-273)

**Purpose:** Receives webhook POSTs from Jamf Setup Manager devices, validates payloads (including prototype pollution guards), performs timing-safe token authentication, persists to D1.

---

### 2. Event Persistence (D1)

**Entry points:**
- `src/events.ts:91` — `insertEvent()`
- `src/events.ts:154` — `fetchEvents()`
- `src/events.ts:243` — `fetchEventStats()`
- `src/events.ts:287` — `toggleArchive()`

**Core files:**
- `src/events.ts` (entire file)

**Purpose:** D1 SQLite operations for storing, retrieving, archiving, and computing statistics on enrollment events.

---

### 3. WebSocket Hub (Durable Object)

**Entry points:**
- `src/DashboardRoom.ts:8` — `DashboardRoom` class
- `src/DashboardRoom.ts:17` — `fetch()` method

**Core files:**
- `src/DashboardRoom.ts` (entire file)

**Purpose:** Cloudflare Durable Object managing WebSocket connections with hibernation. Broadcasts new events to connected dashboards, handles history requests.

---

### 4. HTTP Router and Security

**Entry points:**
- `src/index.ts:542` — `app.fetch()` main router
- `src/index.ts:171` — `validateAccessJwt()`

**Core files:**
- `src/index.ts` (lines 32-163, 389-539)

**Purpose:** Routes requests, enforces security headers (CSP, HSTS), same-origin CORS, Cloudflare Access JWT validation for protected routes.

---

### 5. React Dashboard

**Entry points:**
- `src/main.tsx:8` — React app mount
- `src/components/dashboard/App.tsx:23` — `App()`

**Core files:**
- `src/main.tsx`
- `src/components/dashboard/App.tsx`
- `src/components/dashboard/KpiCards.tsx`
- `src/components/dashboard/EventsTable.tsx`
- `src/components/dashboard/Filters.tsx`
- `src/components/dashboard/EventsChart.tsx`
- `src/components/dashboard/ActionsChart.tsx`
- `src/components/dashboard/ConnectionStatus.tsx`
- `src/components/dashboard/ThemeToggle.tsx`
- `src/hooks/useWebSocket.ts`

**Purpose:** React SPA that renders the dashboard UI — KPI cards, charts, events table, filters, export. Manages filter state, archive operations with optimistic updates, WebSocket connection with reconnect logic.

---

### 6. Shared Types and Validation

**Entry points:**
- `src/types.ts:178` — `validateWebhookPayload()`
- `src/types.ts:51` — `isFinishedWebhook()` type guard

**Core files:**
- `src/types.ts` (entire file)

**Purpose:** Webhook payload interfaces, storage types, UI types, and validation logic shared between Worker and frontend.

---

## Architectural Notes

**Data flow:**
1. Device → `/webhook` → validated → D1 → broadcast via Durable Object
2. Dashboard → `/ws` → DashboardRoom sends history + streams new events
3. Stats computed server-side via D1 queries

**Feature boundaries are clean:** Worker (features 1-4) and React (feature 5) share only types (feature 6). No circular dependencies observed.

**UI primitives excluded:** `src/components/ui/` contains shadcn/ui components — these are imported design primitives, not custom features.
