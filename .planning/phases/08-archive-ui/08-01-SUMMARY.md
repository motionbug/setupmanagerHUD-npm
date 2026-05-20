---
phase: 08-archive-ui
plan: 01
subsystem: dashboard
tags: [ui, archive, tabs, sonner]
dependency_graph:
  requires: [phase-07-api-endpoints]
  provides: [archive-toggle-ui, tooltip-provider, toast-provider]
  affects: [Filters.tsx, App.tsx, main.tsx]
tech_stack:
  added: ["@radix-ui/react-tabs", "sonner"]
  patterns: ["segmented-control", "controlled-tabs", "http-fetch-on-state"]
key_files:
  created:
    - packages/core/src/components/ui/tabs.tsx
    - packages/core/src/components/ui/sonner.tsx
  modified:
    - packages/core/src/main.tsx
    - packages/core/src/components/dashboard/App.tsx
    - packages/core/src/components/dashboard/Filters.tsx
    - packages/core/package.json
decisions:
  - "Tabs component used for segmented control per shadcn/ui pattern"
  - "Sonner used for toast notifications (no next-themes dependency)"
  - "Archive view fetches via HTTP API, active view uses WebSocket events"
metrics:
  duration: 3m
  completed: 2026-05-20T15:45:00Z
---

# Phase 08 Plan 01: Active/Archived Toggle Summary

Segmented control in Filters bar using Radix Tabs, with Sonner toast and TooltipProvider wired at app root.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Install shadcn Tabs and Sonner | c15d351 | tabs.tsx, sonner.tsx, dependencies |
| 2 | Add TooltipProvider and Toaster | d3a79a9 | main.tsx wrapper structure |
| 3 | Add showArchived state | 93e4009 | App.tsx state and API fetch |
| 4 | Add toggle to Filters | db6b9c1 | Filters.tsx Tabs component |

## Implementation Details

### UI Components Added

**tabs.tsx** - Radix Tabs primitives (Tabs, TabsList, TabsTrigger, TabsContent) following shadcn/ui pattern with cn() utility for className merging.

**sonner.tsx** - Sonner Toaster component configured with shadcn theme variables (bg-background, text-foreground, border-border). Removed next-themes dependency.

### App Root Changes

main.tsx now wraps App in TooltipProvider and includes Toaster as sibling:
```tsx
<TooltipProvider>
  <App />
  <Toaster />
</TooltipProvider>
```

### State Management

App.tsx manages:
- `showArchived` boolean (default: false)
- `archivedEvents` array populated via HTTP fetch

When `showArchived` is true, fetches `/api/events?archived=true`. Events displayed are either WebSocket events (active) or fetched archived events.

### Filter UI

Filters.tsx adds segmented control after Model filter:
- TabsList styled with `bg-control border border-edge-subtle rounded-lg`
- TabsTrigger styled with `data-[state=active]:bg-surface data-[state=active]:shadow-sm`
- Controlled via `value` prop based on `showArchived` state

## Verification Results

- TypeScript: PASSED (npm run typecheck)
- All components export correctly
- Dependencies added to package.json

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] packages/core/src/components/ui/tabs.tsx exists
- [x] packages/core/src/components/ui/sonner.tsx exists
- [x] All commits exist (c15d351, d3a79a9, 93e4009, db6b9c1)
