---
phase: 05-starter-template
plan: 01
subsystem: config-api-dashboard-ui
tags: [api-config, version-badge, branding, header]
dependency_graph:
  requires: []
  provides: [api-config-endpoint, version-badge-component, branding-header]
  affects: [packages/core/src/index.ts, packages/core/src/components/dashboard/App.tsx]
tech_stack:
  added: []
  patterns: [server-side-fetch, conditional-render]
key_files:
  created: []
  modified:
    - packages/core/src/index.ts (handleConfig, extended Env)
    - packages/core/src/components/dashboard/App.tsx (VersionBadge, Header branding)
decisions:
  - "Registry fetch is server-side to avoid CSP issues with NPM API"
  - "Config endpoint returns updateAvailable boolean for simple client logic"
  - "VersionBadge positioned fixed bottom-4 left-4 per UI-SPEC"
metrics:
  duration_seconds: 240
  completed: "2026-05-19T23:12:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 0
  files_modified: 2
---

# Phase 05 Plan 01: Core package /api/config endpoint and Dashboard UI Summary

Added /api/config endpoint and updated Dashboard UI with version badge and configurable branding.

## What Changed

### Task 1: Extend Env interface and add /api/config endpoint (0ddd380)

Modified packages/core/src/index.ts:

- Extended Env interface with optional branding vars: `APP_TITLE?: string`, `LOGO_URL?: string`
- Created `handleConfig` function that returns JSON with:
  - `version`: hardcoded "1.1.0" (current package version)
  - `latestVersion`: fetched from registry.npmjs.org (null on error)
  - `updateAvailable`: boolean comparison
  - `appTitle`: `env.APP_TITLE || "Setup Manager HUD"`
  - `logoUrl`: `env.LOGO_URL || null`
- Added route `/api/config` before ASSETS fallback (no auth required, public config only)

### Task 2: Add VersionBadge component and branding-aware Header (d1e3d0d)

Modified packages/core/src/components/dashboard/App.tsx:

- Added `AppConfig` type for config response shape
- Added `config` state with useEffect fetch from `/api/config`
- Created `VersionBadge` component:
  - Fixed positioning: `fixed bottom-4 left-4`
  - Displays current version
  - Shows "Update available: v{X}" with link to npmjs.com when update detected
  - Styled per UI-SPEC with backdrop blur and border
- Modified `Header` component:
  - Accepts `appTitle` and `logoUrl` props
  - Conditionally renders logo image with error fallback
  - Uses configurable title instead of hardcoded text

## Deviations from Plan

None. Both tasks completed as specified.

## Verification Results

| Check | Result |
|-------|--------|
| `grep "handleConfig" packages/core/src/index.ts` | PASSED (2 matches) |
| `grep "VersionBadge" packages/core/src/components/dashboard/App.tsx` | PASSED (3 matches) |
| `grep "APP_TITLE" packages/core/src/index.ts` | PASSED |
| `grep "LOGO_URL" packages/core/src/index.ts` | PASSED |
| TypeScript builds | PASSED |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 0ddd380 | feat(05-01): add /api/config endpoint with version check and branding vars |
| 2 | d1e3d0d | feat(05-01): add VersionBadge component and branding-aware Header |

## Self-Check: PASSED

All modified files verified:
- [x] packages/core/src/index.ts contains handleConfig and extended Env
- [x] packages/core/src/components/dashboard/App.tsx contains VersionBadge and Header branding

All commits verified in git log:
- [x] 0ddd380
- [x] d1e3d0d
