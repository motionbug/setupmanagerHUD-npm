# Duplication Report

Synthesized from within-feature and cross-feature analysis.

## High-Priority Duplications

### 1. Duration Formatting

**Concern:** Formatting seconds into human-readable strings (`Xm Ys` or `Xs`).

| Location | Signature |
|----------|-----------|
| `src/components/dashboard/KpiCards.tsx:28-33` | `formatDuration(seconds: number)` |
| `src/components/dashboard/EventsTable.tsx:108-114` | `formatDuration(seconds?: number)` |

**Divergence:** Accidental copy-paste. EventsTable adds optional handling with `"—"` fallback.

**Unification benefit:** HIGH. Extract to `src/lib/formatters.ts` with optional fallback parameter.

---

### 2. Failed Actions Counting

**Concern:** Counting enrollment actions with `status === "failed"`.

| Location | Pattern |
|----------|---------|
| `src/events.ts:53-58` | `actions.filter((a) => a.status === "failed").length` |
| `src/hooks/useWebSocket.ts:143-146` | `actions.filter((a) => a.status === "failed").length` |
| `src/components/dashboard/EventsTable.tsx:147` | `actions.filter((a) => a.status === "failed").length` |
| `src/components/dashboard/App.tsx:167-169` | `actions.some((a) => a.status === "failed")` |
| `src/components/dashboard/EventsChart.tsx:144` | `actions.some((a) => a.status === "failed")` |
| `src/components/dashboard/ActionsChart.tsx:32-33` | `action.status === "failed"` in reduce |

**Divergence:** Accidental. Same pattern repeated 6 times, slight variations (`.filter().length` vs `.some()`).

**Unification benefit:** HIGH. Add utilities to `src/types.ts`:
- `countFailedActions(actions: EnrollmentAction[]): number`
- `hasFailedActions(actions: EnrollmentAction[]): boolean`

---

### 3. Event Type String Literals

**Concern:** Event type strings hardcoded throughout codebase.

| Location | Usage |
|----------|-------|
| `src/types.ts:101-104` | `VALID_EVENTS` array (not exported) |
| `src/events.ts:165-167` | `"com.jamf.setupmanager.started"` literal |
| `src/events.ts:171` | `"com.jamf.setupmanager.finished"` literal |
| `src/hooks/useWebSocket.ts:127` | `"com.jamf.setupmanager.started"` literal |
| `src/components/dashboard/App.tsx:157` | `"com.jamf.setupmanager.started"` literal |
| `src/components/dashboard/App.tsx:160` | `"com.jamf.setupmanager.finished"` literal |

**Divergence:** Accidental. `VALID_EVENTS` exists but is not exported.

**Unification benefit:** HIGH. Export named constants:
```typescript
export const EVENT_STARTED = "com.jamf.setupmanager.started" as const;
export const EVENT_FINISHED = "com.jamf.setupmanager.finished" as const;
```

---

## Medium-Priority Duplications

### 4. Time Range Cutoff Constants

**Concern:** Millisecond constants for time range filtering.

| Location | Constants |
|----------|-----------|
| `src/events.ts:81-89` | `{ hour: 60*60*1000, day: 24*60*60*1000, week: 7*24*60*60*1000 }` |
| `src/components/dashboard/App.tsx:182-185` | `{ hour: 3600000, day: 86400000, week: 604800000 }` |
| `src/components/dashboard/EventsChart.tsx:128-136` | `{ day, week, month, all }` with literals |

**Divergence:** Accidental. Same values computed differently (expressions vs hardcoded). Chart adds "month" option.

**Unification benefit:** MEDIUM. Export shared constants from `src/types.ts`:
```typescript
export const TIME_RANGE_MS = {
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
  month: 2_592_000_000,
} as const;
```

---

### 5. Success Rate Calculation

**Concern:** Computing success rate percentage from action counts.

| Location | Formula |
|----------|---------|
| `src/events.ts:276-281` | `Math.round(((total - failed) / total) * 100)` with fallback logic |
| `src/hooks/useWebSocket.ts:152-155` | `Math.round(((total - failed) / total) * 100)` with simpler fallback |

**Divergence:** Mostly accidental. Slight difference in fallback when no actions exist.

**Unification benefit:** MEDIUM. The divergence could cause subtle UI inconsistencies. However, server computes from D1 (historical accuracy) while client computes from WebSocket events (real-time). Could extract formula but keep separate call sites.

---

### 6. Chart Tooltip Styles

**Concern:** Recharts tooltip styling objects.

| Location | Style |
|----------|-------|
| `src/components/dashboard/EventsChart.tsx:83-90` | `contentStyle` + `labelStyle` |
| `src/components/dashboard/ActionsChart.tsx:69-76` | Identical `contentStyle` + `labelStyle` |

**Divergence:** Copy-paste.

**Unification benefit:** MEDIUM. Extract to `src/lib/chartStyles.ts` for consistent theming.

---

### 7. Finished Event Filtering Pattern

**Concern:** Type-narrowing filter to get finished webhooks.

| Location | Pattern |
|----------|---------|
| `src/hooks/useWebSocket.ts:129-132` | `.filter((e): e is ... => isFinishedWebhook(e.payload))` |
| `src/components/dashboard/EventsChart.tsx:120-123` | `.filter((e): e is ... => isFinishedWebhook(e.payload))` |
| `src/components/dashboard/ActionsChart.tsx:22-24` | `.filter((e): e is ... => isFinishedWebhook(e.payload))` |

**Divergence:** None — identical pattern repeated for local scoping.

**Unification benefit:** MEDIUM. Add utility to `src/types.ts`:
```typescript
export function getFinishedEvents(events: StoredEvent[]): (StoredEvent & { payload: SetupManagerFinishedWebhook })[] {
  return events.filter((e): e is ... => isFinishedWebhook(e.payload));
}
```

---

## Low-Priority / Legitimate Specialization

### 8. Event Filtering (Server vs Client)

**Locations:** `src/events.ts:165-177` vs `src/components/dashboard/App.tsx:156-171`

**Verdict:** Legitimate specialization. Server filters in SQL for performance, client filters in-memory for responsiveness. Different execution contexts require different implementations.

---

### 9. Validation Object Preamble

**Locations:** `src/types.ts:132-140`, `src/types.ts:145-158`, `src/types.ts:178-189`

**Verdict:** Low priority. The `typeof === 'object' && !null && !hasDangerousKeys` pattern is defensive programming repeated 3 times in the same file. Could extract `isSafeObject()` helper but adds abstraction for minimal gain.

---

### 10. `isStartedWebhook` Type Guard

**Location:** `src/types.ts:60-64`

**Verdict:** Unused. No callers found in production code. Consider removing dead code.

---

## Summary

| Priority | Duplication | Occurrences | Action |
|----------|-------------|-------------|--------|
| HIGH | Duration formatting | 2 | Extract to `lib/formatters.ts` |
| HIGH | Failed actions counting | 6 | Add helpers to `types.ts` |
| HIGH | Event type literals | 6+ | Export constants from `types.ts` |
| MEDIUM | Time range constants | 3 | Export from `types.ts` |
| MEDIUM | Success rate formula | 2 | Consider shared utility |
| MEDIUM | Chart tooltip styles | 2 | Extract to `lib/chartStyles.ts` |
| MEDIUM | Finished event filter | 3 | Add `getFinishedEvents()` to `types.ts` |
| LOW | Validation preamble | 3 | Leave as-is |
| N/A | Dead code | 1 | Remove `isStartedWebhook` |
