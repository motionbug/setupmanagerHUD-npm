# Handoff Prompts

Copy-pasteable `/make-plan` prompts for each unified system. Execute in any order — they're independent.

---

## 1. Shared Formatters

```
/make-plan

Create `src/lib/formatters.ts` with a shared `formatDuration` function and update callers.

**Target:** New file `src/lib/formatters.ts`

**Implementation:**
- Create `formatDuration(seconds: number | undefined, fallback = "—"): string`
- Handle undefined/0 with fallback
- Format as `Xm Ys` for >= 60s, `Xs` otherwise

**Call sites to update:**
1. `src/components/dashboard/KpiCards.tsx:28-33` — remove local `formatDuration`, import from `@/lib/formatters`
2. `src/components/dashboard/EventsTable.tsx:108-114` — remove local `formatDuration`, import from `@/lib/formatters`

**Verification:**
- `npm run typecheck` passes
- KPI cards display duration correctly
- Events table shows duration or "—" for missing values

**Anti-patterns to avoid:**
- Don't add overloads or options beyond `fallback`
- Don't create a formatters "utils" grab-bag — just this one function for now
```

---

## 2. Action Utilities

```
/make-plan

Add action counting utilities to `src/types.ts` and update 8 call sites.

**Target:** `src/types.ts` (additions near existing `isFinishedWebhook`)

**Add these exported functions:**
1. `countFailedActions(actions: EnrollmentAction[] | undefined): number`
2. `hasFailedActions(actions: EnrollmentAction[] | undefined): boolean`
3. `getFinishedEvents(events: StoredEvent[]): (StoredEvent & { payload: SetupManagerFinishedWebhook })[]`

**Call sites to update:**

For `countFailedActions`:
1. `src/events.ts:53-58` — replace `getActionCounts` body with call to new utility
2. `src/hooks/useWebSocket.ts:143-146` — use in reduce
3. `src/components/dashboard/EventsTable.tsx:147` — replace inline filter

For `hasFailedActions`:
4. `src/components/dashboard/App.tsx:167-169` — replace `actions.some()`
5. `src/components/dashboard/EventsChart.tsx:144` — replace `actions.some()`

For `getFinishedEvents`:
6. `src/hooks/useWebSocket.ts:129-132` — replace inline filter
7. `src/components/dashboard/EventsChart.tsx:120-123` — replace inline filter
8. `src/components/dashboard/ActionsChart.tsx:22-24` — replace inline filter

**Verification:**
- `npm run typecheck` passes
- `npm test` passes (events.test.ts covers action counting)
- Dashboard still shows correct failed action counts

**Anti-patterns to avoid:**
- Don't add a generic "action utils" file — keep in types.ts with the type definitions
- Don't change the counting logic — just extract it
```

---

## 3. Event Type Constants

```
/make-plan

Export event type constants from `src/types.ts` and replace string literals.

**Target:** `src/types.ts` (modify existing `VALID_EVENTS`)

**Change at types.ts:101-104:**
```typescript
// Change from:
const VALID_EVENTS = ["com.jamf.setupmanager.started", "com.jamf.setupmanager.finished"] as const;

// To:
export const EVENT_STARTED = "com.jamf.setupmanager.started" as const;
export const EVENT_FINISHED = "com.jamf.setupmanager.finished" as const;
export const VALID_EVENTS = [EVENT_STARTED, EVENT_FINISHED] as const;
```

**Call sites to update:**
1. `src/events.ts:166` — `bindings.push(EVENT_STARTED)`
2. `src/events.ts:171` — `bindings.push(EVENT_FINISHED)`
3. `src/hooks/useWebSocket.ts:127` — `e.payload.event === EVENT_STARTED`
4. `src/components/dashboard/App.tsx:157` — `payload.event !== EVENT_STARTED`
5. `src/components/dashboard/App.tsx:160` — `payload.event !== EVENT_FINISHED`

**Verification:**
- `npm run typecheck` passes
- `npm test` passes
- Grep for string literals to confirm none remain: `grep -r "com.jamf.setupmanager" src/`

**Anti-patterns to avoid:**
- Don't create an "events" or "constants" file — keep with the type definitions
- Don't change the validation logic — just use the constants
```

---

## 4. Time Range Constants

```
/make-plan

Export time range millisecond constants from `src/types.ts` and update callers.

**Target:** `src/types.ts` (new export)

**Add:**
```typescript
export const TIME_RANGE_MS = {
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
  month: 2_592_000_000,
} as const;
```

**Call sites to update:**
1. `src/events.ts:83-87` — replace inline `ranges` object with `TIME_RANGE_MS`
2. `src/components/dashboard/App.tsx:183` — replace inline `ranges` object
3. `src/components/dashboard/EventsChart.tsx:129-134` — use `TIME_RANGE_MS.day`, etc.

**Verification:**
- `npm run typecheck` passes
- Time range filtering still works in dashboard
- Charts still bucket by correct time ranges

**Anti-patterns to avoid:**
- Don't add a separate "time" or "constants" file
- Don't change the filtering logic — just use shared constants
```

---

## 5. Chart Styles

```
/make-plan

Create `src/lib/chartStyles.ts` with shared Recharts tooltip styles.

**Target:** New file `src/lib/chartStyles.ts`

**Implementation:**
```typescript
export const tooltipStyles = {
  contentStyle: {
    backgroundColor: "var(--surface-overlay)",
    border: "1px solid var(--edge)",
    borderRadius: "12px",
    fontSize: "14px",
    padding: "12px 16px",
  },
  labelStyle: {
    color: "var(--ink)",
    fontWeight: 600,
    marginBottom: "4px",
  },
} as const;
```

**Call sites to update:**
1. `src/components/dashboard/EventsChart.tsx:83-90` — replace inline styles with spread: `<Tooltip {...tooltipStyles} />`
2. `src/components/dashboard/ActionsChart.tsx:69-76` — same change

**Verification:**
- `npm run typecheck` passes
- Chart tooltips render identically (visual check)

**Anti-patterns to avoid:**
- Don't add chart colors here — those are component-specific
- Don't make this a "utils" grab-bag
```

---

## 6. Dead Code Removal

```
/make-plan

Remove unused `isStartedWebhook` type guard from `src/types.ts`.

**Target:** `src/types.ts:60-64`

**Action:** Delete the `isStartedWebhook` function and its JSDoc comment.

**Verification:**
- `npm run typecheck` passes
- `npm test` passes
- Grep confirms no callers: `grep -r "isStartedWebhook" src/`

**Anti-patterns to avoid:**
- Don't add a deprecation notice or comment — just delete it
- Don't "fix" it by adding callers — if it's not used, remove it
```

---

## Execution Order

All prompts are independent — execute in any order. Recommended sequence for minimal conflicts:

1. **Event Type Constants** (foundational, no new files)
2. **Time Range Constants** (foundational, no new files)
3. **Action Utilities** (builds on types.ts)
4. **Shared Formatters** (new file, isolated)
5. **Chart Styles** (new file, isolated)
6. **Dead Code Removal** (cleanup, do last)
