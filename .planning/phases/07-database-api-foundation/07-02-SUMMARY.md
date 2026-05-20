---
phase: 07-database-api-foundation
plan: 02
subsystem: api
tags: [archive, api, events, filtering]
dependency_graph:
  requires:
    - "is_archived column on events table (07-01)"
  provides:
    - "GET /api/events archive filtering"
    - "PATCH /api/events/:id/archive toggle endpoint"
    - "toggleArchive function in events.ts"
  affects:
    - "packages/core/src/events.ts"
    - "packages/core/src/index.ts"
tech_stack:
  added: []
  patterns:
    - "SQLite UPDATE with RETURNING for atomic toggle"
    - "Atomic toggle via 1 - is_archived expression"
key_files:
  created: []
  modified:
    - packages/core/src/events.ts
    - packages/core/src/index.ts
    - packages/core/src/events.test.ts
decisions:
  - "Default archive filter (is_archived = 0) matches partial index WHERE clause for query optimization"
  - "Use atomic toggle (1 - is_archived) instead of read-modify-write to prevent race conditions"
  - "PATCH method for toggle (idempotent effect on state transition)"
metrics:
  duration: 207s
  completed: 2026-05-20T13:07:08Z
---

# Phase 07 Plan 02: Archive API Endpoints Summary

Archive filtering for GET /api/events and PATCH /api/events/:id/archive toggle endpoint.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add archive filtering to fetchEvents | 433de14 | packages/core/src/events.ts |
| 2 | Add archive query param and PATCH route handler | b2d5530 | packages/core/src/index.ts |
| 3 | Add tests for archive functionality | 18903e9 | packages/core/src/events.test.ts |

## Key Deliverables

### Archive Filtering in fetchEvents

Extended `FetchEventsOptions` interface with `archived?: boolean` property. When `archived` is falsy (undefined or false), query includes `is_archived = 0` clause to filter out archived records. This matches the partial index WHERE clause from 07-01 for optimal query performance.

### toggleArchive Function

New exported function in events.ts:
```typescript
export async function toggleArchive(
  env: EventsEnv,
  eventId: string
): Promise<{ eventId: string; isArchived: boolean } | null>
```

Uses atomic toggle pattern with `SET is_archived = 1 - is_archived` and RETURNING clause for single-query operation. Returns null when event not found.

### PATCH /api/events/:id/archive Route

New route handler in index.ts:
- Extracts eventId from URL path with decodeURIComponent
- Returns 404 with `{ error: "Event not found" }` for nonexistent events
- Returns 200 with `{ eventId, isArchived }` on success
- CORS updated to allow PATCH method

### Test Coverage

Added 5 new tests:
- fetchEvents filters out archived records by default
- fetchEvents includes archived records when archived=true
- toggleArchive returns toggled state
- toggleArchive returns null when event not found
- toggleArchive returns isArchived: false when unarchiving

## Verification Results

```
Test Files  4 passed (4)
     Tests  108 passed (108)
  Duration  1.05s
```

Typecheck passes with no errors.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] File exists: packages/core/src/events.ts (modified)
- [x] File exists: packages/core/src/index.ts (modified)
- [x] File exists: packages/core/src/events.test.ts (modified)
- [x] Commit exists: 433de14
- [x] Commit exists: b2d5530
- [x] Commit exists: 18903e9
