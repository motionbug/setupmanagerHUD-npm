---
phase: 08-archive-ui
status: decided
created: 2026-05-20
requirements: [UI-01, UI-02, UI-03, UI-04, UI-05]
---

# Phase 8: Archive UI — Context

## Domain

Dashboard controls for archiving enrollment records. Admins can toggle between Active and Archived views, archive/unarchive individual rows, with optimistic UI updates and rollback on failure.

**Depends on:** Phase 7 (completed) — API endpoints ready:
- `GET /api/events` filters out archived by default
- `GET /api/events?archived=true` includes archived
- `PATCH /api/events/:id/archive` toggles archive state

## Decisions

### Archive Toggle Placement (UI-01)

**Decision:** Segmented control in Filters bar — NOT buried in a dropdown.

**Rationale:** Archiving fundamentally changes the context of the entire dashboard. It should be prominent and distinct from data filters.

**Implementation:**
- Segmented control: `[ Active | Archived ]`
- Styled with existing `bg-control border-edge-subtle rounded-lg` pattern
- Position: After existing filters, before Export button (or as first control)
- When "Archived" is selected: Show visual indicator (e.g., subtle tint or "Archived View" badge) so admin never forgets they're viewing historical data

**NOT doing:** Multi-select dropdown option, hidden setting, tab navigation

### Archive Button Design (UI-02, UI-03)

**Decision:** Icon-only ghost button with tooltip, no confirmation modal.

**Rationale:** "Forgiveness over Permission" — archiving is easily reversible, so friction is unnecessary. Modals destroy workflow speed.

**Implementation:**
- HugeIcons: Archive icon (box) for active rows, Restore icon (box-with-up-arrow) for archived rows
- `Button variant="ghost" size="icon"` from shadcn/ui
- Position: Right-most actions column (new column) or integrated into existing row actions
- Tooltip on hover: "Archive" / "Unarchive"

**NOT doing:** Text buttons, confirmation modals, dropdown menu actions

### Optimistic UI Behavior (UI-04, UI-05)

**Decision:** Fade-and-collapse effect, NOT instant snap removal.

**Rationale:** Instant `display: none` causes jarring layout shift. Fade gives visual feedback and smooth transition.

**Implementation sequence:**
1. Admin clicks Archive
2. React immediately sets `isArchiving = true` on the row
3. Tailwind applies `opacity-50 pointer-events-none transition-opacity`
4. After brief transition, row is removed from array
5. Background API call fires

**Rollback on failure:**
1. API returns error (4xx/5xx)
2. Row is re-added to array at original position
3. Opacity class removed
4. Toast notification: `toast({ variant: "destructive", title: "Archive Failed", description: error.message })`

**NOT doing:** Instant removal, slide animations, confirmation before action

## Code Context

### Files to modify

| File | Change |
|------|--------|
| `packages/core/src/components/dashboard/Filters.tsx` | Add Active/Archived segmented control |
| `packages/core/src/components/dashboard/EventsTable.tsx` | Add action column with archive button, optimistic state |
| `packages/core/src/components/dashboard/App.tsx` | fetchEvents respects toggle, WebSocket filtering |
| `packages/core/src/hooks/useWebSocket.ts` | May need filter logic to exclude archived from live feed |

### Existing patterns to follow

- Filters use `Select` with `bg-control border-edge-subtle rounded-lg` styling
- Icons from `@hugeicons/core-free-icons` wrapped in `DashboardIcon`
- Ghost buttons: `variant="ghost" size="sm"` with `hover:bg-control-hover rounded-lg`
- Status badges: `status-badge status-badge-*` classes
- Toast via shadcn/ui toast hook

### HugeIcons to use

- Archive: `Archive01Icon` or `ArchiveIcon` (verify exact name in package)
- Restore: `ArchiveRestore01Icon` or similar
- Fallback: Use `FolderMinus01Icon` / `FolderPlus01Icon` if archive icons unavailable

## Canonical References

- `packages/core/src/components/dashboard/Filters.tsx` — existing filter patterns
- `packages/core/src/components/dashboard/EventsTable.tsx` — table row patterns
- `packages/core/src/components/ui/button.tsx` — shadcn button variants
- `docs/design-principles.md` — IT operations console principles

## Deferred Ideas

None — scope is well-defined by requirements.

## Notes for Researcher

- Verify exact HugeIcons names for archive/restore icons
- Check if shadcn/ui has a SegmentedControl component or if we build from Tabs/RadioGroup
- Confirm toast hook import path and usage pattern in this codebase

## Notes for Planner

- Consider whether to add the action column to existing table or create a separate "row actions" pattern
- WebSocket filtering may be simpler than expected if we just filter client-side based on current view state
- Optimistic update logic could live in a custom hook for reusability

---
*Context captured: 2026-05-20*
