---
status: complete
phase: 08-archive-ui
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md]
started: 2026-05-20T18:00:00Z
updated: 2026-05-20T18:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Active/Archived Toggle Visibility
expected: Dashboard shows a segmented control (Active | Archived) in the Filters bar after the Model filter. The control is styled with subtle borders and the active tab has a shadow effect.
result: pass

### 2. Default View is Active
expected: On page load, the "Active" tab is selected by default. Only non-archived enrollment records are displayed in the table.
result: pass

### 3. Switch to Archived View
expected: Clicking the "Archived" tab fetches archived records from the API (/api/events?archived=true) and displays them in the table. The event count updates to reflect archived records.
result: pass

### 4. Archive Button on Active Rows
expected: In Active view, each event row has an archive button (box-with-down-arrow icon) on the right side. Hovering shows a tooltip with "Archive".
result: pass

### 5. Unarchive Button on Archived Rows
expected: In Archived view, each event row has an unarchive button (box-with-up-arrow icon) on the right side. Hovering shows a tooltip with "Unarchive".
result: pass

### 6. Optimistic Archive Fade
expected: Clicking the archive button on a row immediately fades the row (50% opacity) then removes it from the table after ~150ms. The row disappears without waiting for the API response.
result: pass

### 7. Archive API Success
expected: After archiving a record, switching to Archived view shows the previously archived record in the list.
result: pass

### 8. Unarchive and Restore
expected: In Archived view, clicking unarchive on a row fades and removes it. Switching to Active view shows the unarchived record back in the list.
result: pass

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
