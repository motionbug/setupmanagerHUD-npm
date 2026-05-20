---
phase: 08-archive-ui
plan: 02
subsystem: dashboard
tags: [ui, archive, optimistic-update, rollback, toast]
dependency_graph:
  requires: [08-01-active-archived-toggle]
  provides: [archive-row-action, optimistic-fade, rollback-toast]
  affects: [EventsTable.tsx, App.tsx]
tech_stack:
  added: []
  patterns: ["optimistic-update", "rollback-on-failure", "tooltip-action-button"]
key_files:
  created: []
  modified:
    - packages/core/src/components/dashboard/App.tsx
    - packages/core/src/components/dashboard/EventsTable.tsx
decisions:
  - "ArchiveArrowUpIcon used for unarchive action (not ArchiveRestoreIcon)"
  - "Archive button uses ghost variant with tooltip for consistency with expand button"
  - "Optimistic fade uses 150ms duration-150 transition"
  - "Rollback re-inserts event at original index using splice"
metrics:
  duration: 4m
  completed: 2026-05-20T15:52:31Z
---

# Phase 08 Plan 02: Archive Row Actions Summary

Archive/unarchive buttons on event rows with optimistic fade and rollback on API failure.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Add archivingIds state and handleArchive to App.tsx | 1c7c496 | archivingIds Set, handleArchive with rollback, toast import |
| 2 | Add archive button column to EventsTable.tsx | 448ffdd | Archive01Icon/ArchiveArrowUpIcon, Tooltip, cn transition |
| 3 | Manual verification | N/A | Tests pass, typecheck passes |

## Implementation Details

### App.tsx Changes

Added optimistic archive handling:

```tsx
const [archivingIds, setArchivingIds] = React.useState<Set<string>>(new Set());

const handleArchive = React.useCallback(async (eventId: string, originalIndex: number) => {
  // 1. Add to archivingIds (triggers fade)
  // 2. Store removedEvent reference
  // 3. Wait 150ms for transition
  // 4. Remove from local state
  // 5. PATCH /api/events/${encodeURIComponent(eventId)}/archive
  // 6. On failure: rollback + toast.error
}, [showArchived, archivedEvents, wsEvents]);
```

Key points:
- Uses `encodeURIComponent(eventId)` because eventIds contain colons
- Uses functional `setState` updates to prevent race conditions
- Rollback uses `splice(originalIndex, 0, removedEvent)` to restore position
- Toast shows "Archive failed" or "Unarchive failed" based on current view

### EventsTable.tsx Changes

Extended props interface:
```tsx
interface EventsTableProps {
  events: StoredEvent[];
  maxVisible?: number;
  showArchived: boolean;
  archivingIds: Set<string>;
  onArchive: (eventId: string, index: number) => void;
}
```

Added transition class to TableRow:
```tsx
<TableRow className={cn(
  "hover:bg-surface-raised border-0",
  isArchiving && "opacity-50 pointer-events-none transition-opacity duration-150"
)}>
```

Archive button with Tooltip:
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon" ...>
      <DashboardIcon icon={showArchived ? ArchiveArrowUpIcon : Archive01Icon} ... />
    </Button>
  </TooltipTrigger>
  <TooltipContent side="top">{showArchived ? "Unarchive" : "Archive"}</TooltipContent>
</Tooltip>
```

### Column Changes

- Renamed "Actions" header to "Results" (shows action counts)
- Added new "Archive" column header (w-12, empty label)
- Updated colSpan from 9 to 10 in empty state and expanded row

## Verification Results

- TypeScript: PASSED (npm run typecheck)
- All tests: PASSED (108 tests)
- Archive01Icon renders in Active view
- ArchiveArrowUpIcon renders in Archived view
- Tooltip shows correct label based on view

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Incorrect icon name**
- **Found during:** Task 2
- **Issue:** Plan referenced `ArchiveArrowUpIcon` but initially tried `ArchiveRestoreIcon`
- **Fix:** Used correct export name `ArchiveArrowUpIcon` from @hugeicons/core-free-icons
- **Files modified:** EventsTable.tsx
- **Commit:** 448ffdd

## Self-Check: PASSED

- [x] packages/core/src/components/dashboard/App.tsx modified
- [x] packages/core/src/components/dashboard/EventsTable.tsx modified
- [x] All commits exist (1c7c496, 448ffdd)
- [x] TypeScript passes
- [x] All 108 tests pass
