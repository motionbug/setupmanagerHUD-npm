# Plan: Consolidate Duplications

**Source:** Pathfinder analysis `PATHFINDER-2026-05-28/`  
**Scope:** 6 low-risk refactors with no behavioral changes  
**Estimated effort:** ~95 lines changed across 12 files

---

## Phase 0: Documentation Reference

### Existing Patterns to Follow

**Export pattern** (`src/types.ts`): Use inline `export` keyword, not barrel exports.
```typescript
export function isFinishedWebhook(...) { ... }
export interface StoredEvent { ... }
```

**Lib file pattern** (`src/lib/utils.ts`): Simple exported functions, TypeScript.
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Import alias**: `@/` maps to `src/` (use `@/lib/formatters`, `@/types`, etc.)

### Anti-Patterns to Avoid

- Don't create index.ts barrel files
- Don't add JSDoc comments (codebase doesn't use them)
- Don't change logic while extracting — copy exactly
- Don't add overloads or generics beyond what exists

---

## Phase 1: Event Type Constants

**Target:** `src/types.ts`

### 1.1 Add exported constants (after line 104)

Replace the private `VALID_EVENTS`:
```typescript
// OLD (types.ts:101-104):
const VALID_EVENTS = [
  'com.jamf.setupmanager.started',
  'com.jamf.setupmanager.finished'
] as const;

// NEW:
export const EVENT_STARTED = "com.jamf.setupmanager.started" as const;
export const EVENT_FINISHED = "com.jamf.setupmanager.finished" as const;
const VALID_EVENTS = [EVENT_STARTED, EVENT_FINISHED] as const;
```

### 1.2 Update isFinishedWebhook (line 54)

```typescript
// OLD:
return payload.event === "com.jamf.setupmanager.finished";

// NEW:
return payload.event === EVENT_FINISHED;
```

### 1.3 Update isStartedWebhook (line 63) — will be deleted in Phase 6, but update for consistency if needed

### 1.4 Update call sites

| File | Line | Change |
|------|------|--------|
| `src/events.ts` | 167 | `bindings.push(EVENT_STARTED)` |
| `src/events.ts` | 172 | `bindings.push(EVENT_FINISHED)` |
| `src/hooks/useWebSocket.ts` | 127 | `e.payload.event === EVENT_STARTED` |

**Note:** Keep string literals in `types.ts` interface definitions (lines 8, 35) — those define the type shape.

### Verification

```bash
npm run typecheck
grep -rn '"com.jamf.setupmanager' src/ | grep -v "types.ts"
# Should only show interface type definitions, not runtime comparisons
```

---

## Phase 2: Time Range Constants

**Target:** `src/types.ts`

### 2.1 Add TIME_RANGE_MS export

Add after the event constants:
```typescript
export const TIME_RANGE_MS = {
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
  month: 2_592_000_000,
} as const;
```

### 2.2 Update events.ts (lines 81-89)

```typescript
// OLD:
const ranges: Record<TimeRangeFilter, number> = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
};

// NEW:
import { TIME_RANGE_MS } from "./types";
// ...
const ranges = TIME_RANGE_MS;
```

### 2.3 Update App.tsx (lines 181-187)

```typescript
// OLD:
const ranges = { hour: 3600000, day: 86400000, week: 604800000 };

// NEW:
import { TIME_RANGE_MS } from "@/types";
// ...
const ranges = TIME_RANGE_MS;
```

### 2.4 Update EventsChart.tsx (lines 128-136)

```typescript
// OLD:
const oneHour = 3600000;
const oneDay = 86400000;
const cutoffMap: Record<TimeRange, number> = {
  day: now - oneDay,
  week: now - 7 * oneDay,
  month: now - 30 * oneDay,
  all: 0,
};

// NEW:
import { TIME_RANGE_MS } from "@/types";
// ...
const cutoffMap: Record<TimeRange, number> = {
  day: now - TIME_RANGE_MS.day,
  week: now - TIME_RANGE_MS.week,
  month: now - TIME_RANGE_MS.month,
  all: 0,
};
```

### Verification

```bash
npm run typecheck
grep -rn "3600000\|86400000\|604800000" src/
# Should return no matches outside types.ts
```

---

## Phase 3: Action Utilities

**Target:** `src/types.ts`

### 3.1 Add utility functions (after isFinishedWebhook, ~line 56)

```typescript
export function countFailedActions(
  actions: EnrollmentAction[] | undefined
): number {
  return (actions ?? []).filter((a) => a.status === "failed").length;
}

export function hasFailedActions(
  actions: EnrollmentAction[] | undefined
): boolean {
  return (actions ?? []).some((a) => a.status === "failed");
}

export function getFinishedEvents(
  events: StoredEvent[]
): (StoredEvent & { payload: SetupManagerFinishedWebhook })[] {
  return events.filter(
    (e): e is StoredEvent & { payload: SetupManagerFinishedWebhook } =>
      isFinishedWebhook(e.payload)
  );
}
```

### 3.2 Update events.ts (lines 49-58)

```typescript
// OLD:
function getActionCounts(payload: SetupManagerFinishedWebhook | null): {
  failedActionCount: number;
  totalActionCount: number;
} {
  const actions = payload?.enrollmentActions ?? [];
  return {
    failedActionCount: actions.filter((action) => action.status === "failed").length,
    totalActionCount: actions.length,
  };
}

// NEW:
import { countFailedActions } from "./types";
// ...
function getActionCounts(payload: SetupManagerFinishedWebhook | null): {
  failedActionCount: number;
  totalActionCount: number;
} {
  const actions = payload?.enrollmentActions ?? [];
  return {
    failedActionCount: countFailedActions(actions),
    totalActionCount: actions.length,
  };
}
```

### 3.3 Update useWebSocket.ts

**Lines 129-132:**
```typescript
// OLD:
const finished = state.events.filter(
  (e): e is StoredEvent & { payload: SetupManagerFinishedWebhook } =>
    isFinishedWebhook(e.payload)
);

// NEW:
import { getFinishedEvents, countFailedActions } from "@/types";
// ...
const finished = getFinishedEvents(state.events);
```

**Lines 143-146:**
```typescript
// OLD:
const failedActions = finished.reduce((count, e) => {
  const actions = e.payload.enrollmentActions || [];
  return count + actions.filter((a) => a.status === "failed").length;
}, 0);

// NEW:
const failedActions = finished.reduce(
  (count, e) => count + countFailedActions(e.payload.enrollmentActions),
  0
);
```

### 3.4 Update App.tsx (lines 167-169)

```typescript
// OLD:
const actions = payload.enrollmentActions || [];
if (!actions.some((a) => a.status === "failed")) {
  return false;
}

// NEW:
import { hasFailedActions } from "@/types";
// ...
if (!hasFailedActions(payload.enrollmentActions)) {
  return false;
}
```

### 3.5 Update EventsChart.tsx

**Lines 120-123:**
```typescript
// OLD:
const finishedEvents = events.filter(
  (e): e is StoredEvent & { payload: SetupManagerFinishedWebhook } =>
    isFinishedWebhook(e.payload)
);

// NEW:
import { getFinishedEvents, hasFailedActions } from "@/types";
// ...
const finishedEvents = getFinishedEvents(events);
```

**Lines 143-144:**
```typescript
// OLD:
const actions = payload.enrollmentActions || [];
const hasFailed = actions.some((a) => a.status === "failed");

// NEW:
const hasFailed = hasFailedActions(payload.enrollmentActions);
```

### 3.6 Update ActionsChart.tsx (lines 22-24)

```typescript
// OLD:
.filter((e): e is StoredEvent & { payload: SetupManagerFinishedWebhook } =>
  isFinishedWebhook(e.payload)
)

// NEW:
import { getFinishedEvents } from "@/types";
// ...
// Use getFinishedEvents before the chain, or inline
```

### 3.7 Update EventsTable.tsx (line 147)

```typescript
// OLD:
const failedCount = actions.filter((a) => a.status === "failed").length;

// NEW:
import { countFailedActions } from "@/types";
// ...
const failedCount = countFailedActions(actions);
```

### Verification

```bash
npm run typecheck
npm test
grep -rn 'status === "failed"' src/ | grep -v types.ts
# Should return no matches
```

---

## Phase 4: Duration Formatter

**Target:** New file `src/lib/formatters.ts`

### 4.1 Create src/lib/formatters.ts

```typescript
export function formatDuration(
  seconds: number | undefined,
  fallback = "—"
): string {
  if (seconds === undefined || seconds === 0) return fallback;
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}
```

### 4.2 Update KpiCards.tsx

Remove lines 28-33 (local formatDuration), add import:
```typescript
import { formatDuration } from "@/lib/formatters";
```

Update call site (was receiving `number`, now can pass `undefined`):
```typescript
// The existing call should still work since it passes a number
formatDuration(stats.avgDuration)
```

### 4.3 Update EventsTable.tsx

Remove lines 108-114 (local formatDuration), add import:
```typescript
import { formatDuration } from "@/lib/formatters";
```

Existing calls should work unchanged.

### Verification

```bash
npm run typecheck
grep -rn "const formatDuration" src/
# Should return no matches
```

---

## Phase 5: Chart Styles

**Target:** New file `src/lib/chartStyles.ts`

### 5.1 Create src/lib/chartStyles.ts

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

export const CHART_COLORS = {
  success: "var(--jamf-green)",
  failure: "var(--jamf-red)",
} as const;
```

### 5.2 Update EventsChart.tsx

Remove lines 21-22 (SUCCESS_COLOR, FAILURE_COLOR), add import:
```typescript
import { tooltipStyles, CHART_COLORS } from "@/lib/chartStyles";
```

Update Tooltip (lines 83-90):
```typescript
// OLD:
<Tooltip
  contentStyle={{...}}
  labelStyle={{...}}
/>

// NEW:
<Tooltip {...tooltipStyles} />
```

Update bar colors:
```typescript
// OLD:
fill={SUCCESS_COLOR}
fill={FAILURE_COLOR}

// NEW:
fill={CHART_COLORS.success}
fill={CHART_COLORS.failure}
```

### 5.3 Update ActionsChart.tsx

Same changes as EventsChart.tsx:
- Remove lines 18-19 (color constants)
- Add import
- Replace `<Tooltip contentStyle={...} labelStyle={...} />` with `<Tooltip {...tooltipStyles} />`
- Replace color references

### Verification

```bash
npm run typecheck
grep -rn "SUCCESS_COLOR\|FAILURE_COLOR" src/
# Should return no matches
```

---

## Phase 6: Dead Code Removal

**Target:** `src/types.ts`

### 6.1 Delete isStartedWebhook (lines 60-64)

Remove:
```typescript
export function isStartedWebhook(
  payload: SetupManagerWebhook
): payload is SetupManagerStartedWebhook {
  return payload.event === "com.jamf.setupmanager.started";
}
```

### Verification

```bash
npm run typecheck
npm test
grep -rn "isStartedWebhook" src/
# Should return no matches
```

---

## Final Verification

After all phases:

```bash
npm run typecheck
npm test
npm run build
```

### Grep checks for remaining duplication

```bash
# Event type literals (should only be in type definitions)
grep -rn '"com.jamf.setupmanager' src/ | grep -v "types.ts"

# Magic numbers (should be none)
grep -rn "3600000\|86400000\|604800000" src/

# Inline failed checks (should be none)
grep -rn 'status === "failed"' src/ | grep -v types.ts

# Local formatDuration (should be none)
grep -rn "const formatDuration" src/

# Inline color constants (should be none)
grep -rn "SUCCESS_COLOR\|FAILURE_COLOR" src/
```

---

## Summary

| Phase | Files Created | Files Modified | Lines Changed |
|-------|---------------|----------------|---------------|
| 1. Event Constants | 0 | 3 | ~15 |
| 2. Time Constants | 0 | 4 | ~20 |
| 3. Action Utilities | 0 | 6 | ~40 |
| 4. Duration Formatter | 1 | 2 | ~15 |
| 5. Chart Styles | 1 | 2 | ~20 |
| 6. Dead Code | 0 | 1 | -5 |
| **Total** | **2** | **12** | **~105** |
