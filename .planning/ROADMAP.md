# Roadmap: Setup Manager HUD

## Milestones

- [x] **v1.0 Documentation Update** - Phases 1-3 (shipped 2026-04-25) - [archive](milestones/v1.0-ROADMAP.md)
- [x] **v1.1 NPM Package Upgrade Path** - Phases 4-6 (shipped 2026-05-20) - [archive](milestones/v1.1-ROADMAP.md)
- [ ] **v1.2 Archive State** - Phases 7-8 (in progress)

## Phases

<details>
<summary>v1.0 Documentation Update (Phases 1-3) - SHIPPED 2026-04-25</summary>

- [x] Phase 1: Wiki Foundation (1/1 plans) - completed 2026-04-19
- [x] Phase 2: Wiki Content (2/2 plans) - completed 2026-04-20
- [x] Phase 3: README Integration (1/1 plan) - completed 2026-04-25

</details>

<details>
<summary>v1.1 NPM Package Upgrade Path (Phases 4-6) - SHIPPED 2026-05-20</summary>

- [x] Phase 4: Package Extraction (3/3 plans) - completed 2026-05-19
- [x] Phase 5: Starter Template (3/3 plans) - completed 2026-05-19
- [x] Phase 6: Deployment Automation (2/2 plans) - completed 2026-05-19

</details>

### v1.2 Archive State

- [ ] **Phase 7: Database & API Foundation** - Backend infrastructure for archive state
- [x] **Phase 8: Archive UI** - Dashboard controls for archiving records - completed 2026-05-20
- [ ] **Phase 8.1: Polish: optimistic fade animation** (INSERTED) - Urgent polish work

## Phase Details

### Phase 7: Database & API Foundation
**Goal**: Backend supports archive state with efficient queries and toggle endpoint
**Depends on**: Nothing (first phase of v1.2)
**Requirements**: DB-01, DB-02, API-01, API-02, API-03
**Success Criteria** (what must be TRUE):
  1. D1 database has is_archived column on events table
  2. GET /api/events returns only non-archived records by default
  3. GET /api/events?archived=true returns all records including archived
  4. PATCH /api/events/:id/archive toggles a record's archive state and returns updated record
  5. Archived queries perform efficiently (partial index working)
**Plans**: 2 plans
Plans:
- [x] 07-01-PLAN.md — D1 migration adding is_archived column and partial index
- [x] 07-02-PLAN.md — Archive filtering in fetchEvents and PATCH toggle endpoint

### Phase 8: Archive UI
**Goal**: Admins can archive and unarchive enrollment records from the dashboard
**Depends on**: Phase 7
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. Filter toggle on dashboard allows admin to show/hide archived records
  2. Archive button appears on event rows when viewing active records
  3. Unarchive button appears on event rows when viewing archived records
  4. Clicking archive/unarchive immediately updates the UI (optimistic)
  5. If API call fails, row is restored and error toast is shown
**Plans**: 2 plans
Plans:
- [x] 08-01-PLAN.md — shadcn components (Tabs, Sonner) and Active/Archived toggle
- [x] 08-02-PLAN.md — Archive button on rows with optimistic updates and rollback

### Phase 8.1: Polish: optimistic fade animation
**Goal**: Archive/unarchive animation completes visibly before row removal from DOM
**Depends on**: Phase 8
**Requirements**: None (polish phase)
**Success Criteria** (what must be TRUE):
  1. Row fades to opacity 0 over ~200ms before being removed from DOM
  2. Animation completes before row is removed from events array
  3. Rollback on failure still works correctly
**Plans**: 1 plan
Plans:
- [ ] 08.1-01-PLAN.md — Delayed state removal and CSS transition update

## Progress

**Execution Order:** Phases 1-8 complete, Phase 8.1 next

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Wiki Foundation | v1.0 | 1/1 | Complete | 2026-04-19 |
| 2. Wiki Content | v1.0 | 2/2 | Complete | 2026-04-20 |
| 3. README Integration | v1.0 | 1/1 | Complete | 2026-04-25 |
| 4. Package Extraction | v1.1 | 3/3 | Complete | 2026-05-19 |
| 5. Starter Template | v1.1 | 3/3 | Complete | 2026-05-19 |
| 6. Deployment Automation | v1.1 | 2/2 | Complete | 2026-05-19 |
| 7. Database & API Foundation | v1.2 | 2/2 | Complete | 2026-05-20 |
| 8. Archive UI | v1.2 | 2/2 | Complete | 2026-05-20 |
| 8.1 Polish: optimistic fade animation | v1.2 | 0/1 | Planned | - |

---
*Last updated: 2026-05-21 after Phase 8.1 planning*
