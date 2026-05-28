# Webhook Ingestion Flowchart

## Sources Consulted

| File | Line Range | Purpose |
|------|------------|---------|
| `src/index.ts` | 1-163, 280-400 | Main worker entry, `handleWebhook()`, helper functions |
| `src/types.ts` | 1-273 | `validateWebhookPayload()` and supporting validators |
| `src/events.ts` | 1-152 | `insertEvent()` D1 persistence |
| `src/DashboardRoom.ts` | 1-43 | Durable Object `/broadcast` handler |

## Flowchart

```mermaid
flowchart TD
    A["POST /webhook received<br/>index.ts:309"] --> B{"Content-Length > 8KB?<br/>index.ts:311-312"}
    B -- Yes --> C["413 Payload too large<br/>index.ts:317"]
    B -- No --> D{"Content-Type = application/json?<br/>index.ts:321-322"}
    D -- No --> E["415 Invalid Content-Type<br/>index.ts:324"]
    D -- Yes --> F{"WEBHOOK_TOKEN configured?<br/>index.ts:327-328"}
    F -- No --> G["503 Not configured<br/>index.ts:330"]
    F -- Yes --> H["Extract Authorization header<br/>index.ts:333-336"]
    H --> I{"timingSafeEqual() passes?<br/>index.ts:337-340"}
    I -- No --> J["401 Unauthorized<br/>index.ts:347"]
    I -- Yes --> K["Parse JSON body<br/>index.ts:351-352"]
    K -- Parse error --> L["400 Invalid JSON<br/>index.ts:355"]
    K -- Success --> M["validateWebhookPayload()<br/>types.ts:178"]
    M --> N{"Payload is object & non-null?<br/>types.ts:180"}
    N -- No --> O["Validation failed<br/>types.ts:181"]
    N -- Yes --> P{"hasDangerousKeys()?<br/>types.ts:185"}
    P -- Yes --> Q["Reject prototype pollution<br/>types.ts:187"]
    P -- No --> R{"Valid event type?<br/>types.ts:192"}
    R -- No --> S["Invalid event type<br/>types.ts:195"]
    R -- Yes --> T["Validate required base fields<br/>types.ts:200-204"]
    T -- Missing field --> U["Missing required field<br/>types.ts:202"]
    T -- OK --> V["Validate timestamps<br/>types.ts:207-212"]
    V -- Invalid --> W["Invalid timestamp<br/>types.ts:209/211"]
    V -- OK --> X{"Finished event?<br/>types.ts:223"}
    X -- Yes --> Y["Validate finished fields<br/>types.ts:224-262"]
    Y -- Invalid --> Z["Finished validation failed<br/>types.ts:227-261"]
    Y -- OK --> AA["Return valid: true<br/>types.ts:272"]
    X -- No --> AA
    O --> AB["400 Invalid payload<br/>index.ts:362"]
    Q --> AB
    S --> AB
    U --> AB
    W --> AB
    Z --> AB
    AA --> AC{"validation.valid?<br/>index.ts:359"}
    AC -- No --> AB
    AC -- Yes --> AD["Generate eventId + timestamp<br/>index.ts:366-368"]
    AD --> AE["Build StoredEvent<br/>index.ts:370"]
    AE --> AF{"env.DB exists?<br/>index.ts:372"}
    AF -- No --> AG["503 DB unavailable<br/>index.ts:374"]
    AF -- Yes --> AH["insertEvent()<br/>events.ts:91"]
    AH --> AI["Extract finished payload<br/>events.ts:96"]
    AI --> AJ["getActionCounts()<br/>events.ts:97"]
    AJ --> AK["D1 INSERT INTO events<br/>events.ts:99-151"]
    AK --> AL["Get Durable Object ID<br/>index.ts:379"]
    AL --> AM["Get DashboardRoom stub<br/>index.ts:380"]
    AM --> AN["POST /broadcast<br/>index.ts:381-384"]
    AN --> AO["DashboardRoom.fetch() /broadcast<br/>DashboardRoom.ts:21"]
    AO --> AP["Parse message text<br/>DashboardRoom.ts:22"]
    AP --> AQ["getWebSockets()<br/>DashboardRoom.ts:23"]
    AQ --> AR["Loop: ws.send(message)<br/>DashboardRoom.ts:27-35"]
    AR --> AS["Return broadcast result<br/>DashboardRoom.ts:37-42"]
    AS --> AT["200 success + eventId<br/>index.ts:386"]
```

## External Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `timingSafeEqual()` | `index.ts:138-163` | Constant-time token comparison via HMAC-SHA256 |
| `insertEvent()` | `events.ts:91` | D1 persistence |
| `DashboardRoom` | `DashboardRoom.ts` | WebSocket broadcast |

## Side Effects

1. **D1 Write**: `insertEvent()` at `events.ts:99-151` writes 23 columns to the `events` table
2. **Durable Object Call**: `DashboardRoom.fetch("/broadcast")` triggers WebSocket broadcast to all connected clients
