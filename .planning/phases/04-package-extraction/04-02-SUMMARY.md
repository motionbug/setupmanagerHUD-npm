---
phase: 04-package-extraction
plan: 02
subsystem: worker-exports
tags: [dual-export, migrations, tsup, npm-package]
dependency_graph:
  requires: [04-01]
  provides: [named-app-export, env-type-export, migration-sync-script]
  affects: [packages/core/src/index.ts, packages/core/scripts/]
tech_stack:
  added: []
  patterns: [dual-export, additive-sync]
key_files:
  created:
    - packages/core/scripts/sync-migrations.js (additive migration sync)
    - packages/core/index.html (vite build entry point)
  modified:
    - packages/core/src/index.ts (dual export pattern)
    - packages/core/src/index.test.ts (updated mock Env fields)
decisions:
  - "Env interface exported with required ASSETS and WEBHOOK_TOKEN fields per D-17"
  - "Named app export + default export preserves backwards compatibility per D-05"
  - "sync-migrations.js uses additive-only logic per D-12, D-13"
metrics:
  duration_seconds: 172
  completed: "2026-05-19T12:07:18Z"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 2
---

# Phase 04 Plan 02: Worker Dual Export and Migration Sync Summary

Dual export pattern for app/DashboardRoom and additive-only migration sync script for postinstall.

## What Changed

### Task 1: Refactor Worker entry point for dual export pattern (2e4ab87)

Modified packages/core/src/index.ts to implement the dual export pattern per D-05 and D-17:

- Changed `interface Env` to `export interface Env` with 7 fields:
  - `DB: D1Database` (required)
  - `DASHBOARD_ROOM: DurableObjectNamespace` (required)
  - `ASSETS: Fetcher` (required - package requires ASSETS binding)
  - `WEBHOOK_TOKEN: string` (required)
  - `WEBHOOK_SECRET?: string` (optional legacy alias)
  - `CF_ACCESS_AUD?: string` (optional)
  - `CF_ACCESS_TEAM_DOMAIN?: string` (optional)
- Changed `export default { fetch }` to `export const app = { fetch }` (named export for consumers)
- Added `export default app;` for backwards compatibility (direct wrangler deploy)
- Updated test mocks in index.test.ts with required ASSETS and WEBHOOK_TOKEN fields

### Task 2: Create sync-migrations.js for additive migration copying (e673de3)

Created packages/core/scripts/sync-migrations.js with:

- ESM imports (`import fs from 'fs'`)
- Additive-only logic: `fs.existsSync(destFile)` check before copying
- Creates migrations directory if missing
- Logs "Copied migration:" or "Skipped (exists):" for each file
- Error handling for missing source directory

### Task 3: Verify build pipeline produces all outputs (86079ff)

Fixed missing index.html and verified full build:

- Copied index.html to packages/core (vite entry point)
- Build produces all outputs:
  - dist/index.html (Vite React frontend)
  - dist-worker/index.js (tsup Worker bundle)
  - dist-worker/index.d.ts (TypeScript declarations with Env, app, DashboardRoom)
  - dist-scripts/sync-migrations.js (postinstall script)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test mock Env types**
- **Found during:** Task 1
- **Issue:** Test file Env mocks missing required ASSETS and WEBHOOK_TOKEN fields after Env interface change
- **Fix:** Added ASSETS: {} as Fetcher and WEBHOOK_TOKEN: "test-token" to test mocks
- **Files modified:** packages/core/src/index.test.ts
- **Commit:** 2e4ab87

**2. [Rule 3 - Blocking] Fixed missing index.html in packages/core**
- **Found during:** Task 3
- **Issue:** Vite build failed because index.html was at root, not in packages/core
- **Fix:** Copied index.html to packages/core directory
- **Files modified:** packages/core/index.html
- **Commit:** 86079ff

## Verification Results

| Check | Result |
|-------|--------|
| `grep "export const app" src/index.ts` | PASSED |
| `grep "export default app" src/index.ts` | PASSED |
| `grep "export interface Env" src/index.ts` | PASSED |
| npm run build exits 0 | PASSED |
| dist/index.html exists | PASSED |
| dist-worker/index.js exists | PASSED |
| dist-worker/index.d.ts exists | PASSED |
| dist-scripts/sync-migrations.js exists | PASSED |
| npm test (103 tests) | PASSED |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 2e4ab87 | feat(04-02): refactor Worker entry point for dual export pattern |
| 2 | e673de3 | feat(04-02): create sync-migrations.js for additive migration copying |
| 3 | 86079ff | chore(04-02): add index.html to packages/core for vite build |

## Self-Check: PASSED

All created files verified to exist:
- [x] packages/core/scripts/sync-migrations.js
- [x] packages/core/index.html
- [x] packages/core/src/index.ts (modified)
- [x] packages/core/dist-worker/index.d.ts (build output)

All commits verified in git log:
- [x] 2e4ab87
- [x] e673de3
- [x] 86079ff
