# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Setup Manager HUD is a real-time webhook dashboard for Jamf Setup Manager, deployed to Cloudflare Workers. It receives webhook events from macOS devices during enrollment and displays them on a React dashboard via WebSocket.

**Stack:** Cloudflare Workers, Durable Objects, D1 (SQLite), React 19, TypeScript, Vite, Tailwind CSS v4

**Requirements:** Node.js >=20

**Authentication model:** Cloudflare Access protects the dashboard and API endpoints at the edge. The `/webhook` endpoint requires `WEBHOOK_TOKEN` validation in production — Setup Manager sends this via the `token` key in its webhook configuration plist. Bearer token format is also supported for manual `curl` testing.

## Development Commands

```bash
npm install          # Install dependencies (requires Node.js >=20)
npm run dev          # Vite dev server (frontend only, hot reload on :5173)
npm run dev:worker   # Wrangler dev (full stack with D1, Durable Objects, WebSocket on :8787)
npm run build        # Build frontend to dist/
npm run deploy       # Build + deploy to Cloudflare Workers
npm run typecheck    # TypeScript type checking
npm test             # Build and run Vitest suite once
npm run test:watch   # Run Vitest in watch mode
```

**Local development workflow:** Run `npm run dev` and `npm run dev:worker` in separate terminals. Vite proxies `/webhook`, `/api/*`, and `/ws` to the Worker at localhost:8787.

**Secrets:** Managed via `wrangler secret put WEBHOOK_TOKEN`, never committed. For local dev, use `.dev.vars` (see `.dev.vars.example`).

## Architecture

```
src/
├── index.ts           # Worker entry: routes, CORS, JWT validation, webhook handler, security headers
├── DashboardRoom.ts   # Durable Object: WebSocket hub with hibernation
├── events.ts          # D1 event persistence helpers (insert, fetch, stats, cleanup)
├── types.ts           # Shared types + webhook payload validation
├── main.tsx           # React entry point
├── hooks/
│   └── useWebSocket.ts   # WebSocket client with reconnect + stats computation
├── lib/               # Utilities
├── styles/
│   └── globals.css    # Global styles
└── components/
    ├── dashboard/     # App, KpiCards, EventsTable, Charts, Filters, etc.
    └── ui/            # shadcn/ui primitives (Button, Card, Table, etc.)
```

**Data flow:**
1. Device POSTs to `/webhook` → validated → stored in D1 → broadcast via Durable Object
2. Dashboard connects to `/ws` → DashboardRoom sends history + streams new events
3. Stats computed server-side via D1 queries in `events.ts`

**Path alias:** `@/` maps to `src/` (configured in vite.config.ts and tsconfig.json)

**Design principles:** See `docs/design-principles.md` for UI guidance. The dashboard is an IT operations console — prefer dense, scannable layouts, stable tables, compact charts, clear failure states, and restrained motion.

## Key Constants

| Constant | Value | File | Purpose |
|---|---|---|---|
| `MAX_WEBHOOK_PAYLOAD_SIZE` | `8192` (8 KB) | `src/index.ts` | Max webhook request body |
| `MAX_WS_MESSAGE_SIZE` | `4096` (4 KB) | `src/DashboardRoom.ts` | Max WebSocket message |
| `MAX_HISTORY` | `200` | `src/DashboardRoom.ts` | Max events returned for history requests |

## Security Hardening Applied

Key security measures in this codebase:

- **Security headers** (`src/index.ts`): CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy on all responses
- **Timing-safe token comparison** (`src/index.ts`): HMAC-SHA256 digests for constant-time comparison
- **Payload size limit**: 8 KB max on `/webhook`, 4 KB max on WebSocket messages
- **Prototype pollution guard** (`src/types.ts`): Rejects `__proto__`, `constructor`, `prototype` keys
- **Same-origin CORS** (`src/index.ts`): Only allows CORS for same-origin requests
- **Content-Type validation**: `/webhook` requires `application/json` (blocks form-based CSRF)
- **CSV injection sanitization** (`src/components/dashboard/Filters.tsx`): Prefixes formula-triggering characters
- **Generic error responses**: Validation errors logged server-side, generic message to client

### Security Configuration Notes

- **Webhook authentication**: `WEBHOOK_TOKEN` is the production secret; `/webhook` must stay reachable outside Cloudflare Access but rejects missing/wrong tokens
- **Cloudflare Access**: Dashboard, API, WebSocket routes require `CF_ACCESS_AUD` and `CF_ACCESS_TEAM_DOMAIN` to be configured
- **Never commit**: `.dev.vars`, real webhook tokens, Access audience values, team domains, Cloudflare account IDs, or customer-specific D1 database IDs

### Operational

- Audit Cloudflare Access membership periodically
- Document and practice `WEBHOOK_TOKEN` rotation procedure
- Monitor `/api/health` from outside perimeter to detect accidental public exposure

## Testing

Tests are colocated next to source files:
- `src/index.test.ts` — Worker routes, CORS, health endpoint
- `src/events.test.ts` — D1 persistence helpers
- `src/types.test.ts` — Webhook payload validation
- `src/security-headers.test.ts` — Security header verification
- `test/webhook-auth.test.ts` — Webhook token authentication flows

Vitest runs through `@cloudflare/vitest-pool-workers`, so Worker behavior is tested in the Cloudflare runtime.

```bash
npm test                           # Run all tests once
npm run test:watch                 # Watch mode
npm test -- src/events.test.ts    # Run a single test file
```

Run `npm run typecheck` and `npm test` before PRs. Cover webhook auth, payload validation, D1 behavior, Durable Object broadcasts, Access/JWT behavior, and security headers when touching those paths.

Send test webhooks with the dummy data script:
```bash
WORKER_URL=https://your-worker.workers.dev node packages/core/scripts/send-dummy-events.js
```

Or manually:
```bash
curl -X POST http://localhost:8787/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Started","event":"com.jamf.setupmanager.started","timestamp":"2025-01-01T00:00:00Z","started":"2025-01-01T00:00:00Z","modelName":"MacBook Pro","modelIdentifier":"Mac15,3","macOSBuild":"24A335","macOSVersion":"15.0","serialNumber":"TEST001","setupManagerVersion":"2.0.0"}'
```

## Deployment Notes

- SVG assets must be in `public/` for the `PoweredByJamf` component
- D1 database binding must be configured in `wrangler.toml` or Cloudflare dashboard
- Cloudflare Access JWT validation requires `CF_ACCESS_AUD` and `CF_ACCESS_TEAM_DOMAIN` in `wrangler.toml` vars
- Rate limiting is handled via Cloudflare WAF rules (configured in dashboard, not code)
- Customer docs must use placeholders for `CF_ACCESS_AUD`, `CF_ACCESS_TEAM_DOMAIN`, D1 database IDs, and tokens

## Dashboard Components

### EventsChart (`src/components/dashboard/EventsChart.tsx`)
Displays enrollment success/failure rates over time using a grouped bar chart. Features:
- Time range toggles: 24h, 7d, 30d, All
- Only counts finished events (not started)
- Success = no failed enrollment actions; Failure = at least one failed action
- Colors match Action Quality chart (chart-2 for success, chart-5 for failure)

### KpiCards (`src/components/dashboard/KpiCards.tsx`)
Four stat cards showing started, finished, avg duration, and failed actions. The Failed Actions card:
- Becomes clickable when > 0 (triggers "failed" filter)
- Shows red glow effect when failures exist

### Filters (`src/components/dashboard/Filters.tsx`)
Filter controls with search, event type, macOS version, and model dropdowns. Features:
- Red "Clear filters" badge appears above search when any filter is active
- CSV export sanitizes formula-triggering characters (security hardening)
