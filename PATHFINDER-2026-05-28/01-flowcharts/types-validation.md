# Shared Types and Validation Flowchart

## Sources Consulted

| File | Line Range | Purpose |
|------|-----------|---------|
| `src/types.ts` | 1-316 | Full file - validation logic, type guards, type definitions |
| `src/index.ts` | 350-387 | validateWebhookPayload caller in webhook handler |

## Flowchart

```mermaid
flowchart TD
    subgraph "Entry Points"
        A["validateWebhookPayload()<br/>types.ts:178"]
        B["isFinishedWebhook()<br/>types.ts:51"]
        C["isStartedWebhook()<br/>types.ts:60"]
    end

    subgraph "validateWebhookPayload Flow"
        A --> D{"typeof payload === 'object'<br/>&& payload !== null<br/>types.ts:180"}
        D -->|No| E["Return: Payload must be<br/>non-null object<br/>types.ts:181"]
        D -->|Yes| F{"hasDangerousKeys()<br/>types.ts:185"}
        F -->|Yes| G["Return: forbidden<br/>property names<br/>types.ts:187"]
        F -->|No| H{"VALID_EVENTS.includes()<br/>types.ts:192"}
        H -->|No| I["Return: Invalid<br/>event type<br/>types.ts:195"]
        H -->|Yes| J["Loop REQUIRED_BASE_FIELDS<br/>types.ts:200"]
        J --> K{"isNonEmptyString()<br/>types.ts:201"}
        K -->|No| L["Return: Missing/invalid<br/>required field<br/>types.ts:202"]
        K -->|Yes| M{"isValidTimestamp(timestamp)<br/>types.ts:207"}
        M -->|No| N["Return: Invalid<br/>timestamp format<br/>types.ts:208"]
        M -->|Yes| O{"isValidTimestamp(started)<br/>types.ts:210"}
        O -->|No| P["Return: Invalid started<br/>timestamp format<br/>types.ts:211"]
        O -->|Yes| Q{"name matches event?<br/>types.ts:215-220"}
        Q -->|No| R["Return: name mismatch<br/>types.ts:217/219"]
        Q -->|Yes| S{"event === finished?<br/>types.ts:223"}
        S -->|No| W
        S -->|Yes| T["Validate REQUIRED_FINISHED_FIELDS<br/>types.ts:224"]
        T --> T1{"isNonNegativeNumber(duration)<br/>types.ts:226"}
        T1 -->|No| T2["Return: duration error<br/>types.ts:227"]
        T1 -->|Yes| T3{"isValidTimestamp(finished)<br/>types.ts:234"}
        T3 -->|No| T4["Return: Invalid finished<br/>timestamp<br/>types.ts:235"]
        T3 -->|Yes| U{"enrollmentActions?<br/>types.ts:239"}
        U -->|Defined| U1{"Array.isArray()<br/>types.ts:240"}
        U1 -->|No| U2["Return: must be array<br/>types.ts:241"]
        U1 -->|Yes| U3["Loop: isValidEnrollmentAction()<br/>types.ts:243-244"]
        U3 -->|Invalid| U4["Return: Invalid action<br/>at index<br/>types.ts:245"]
        U3 -->|Valid| V
        U -->|Undefined| V{"userEntry?<br/>types.ts:251"}
        V -->|Defined & Invalid| V1["Return: Invalid userEntry<br/>types.ts:252"]
        V -->|Valid/Undef| V2{"throughput fields?<br/>types.ts:256-260"}
        V2 -->|Invalid| V3["Return: throughput error<br/>types.ts:257/259"]
        V2 -->|Valid| W
        W["Validate optional strings<br/>types.ts:265-269"]
        W --> W1{"optional field is string?<br/>types.ts:267"}
        W1 -->|No| W2["Return: must be string<br/>types.ts:268"]
        W1 -->|Yes| X["Return: valid: true<br/>types.ts:272"]
    end

    subgraph "Helper Functions"
        HA["hasDangerousKeys()<br/>types.ts:168"]
        HA --> HA1["Check DANGEROUS_KEYS<br/>types.ts:163"]
        HA1 --> HA2["__proto__, constructor,<br/>prototype<br/>types.ts:163"]

        HB["isNonEmptyString()<br/>types.ts:109"]
        HB --> HB1["typeof === 'string'<br/>&& trim().length > 0<br/>types.ts:110"]

        HC["isValidTimestamp()<br/>types.ts:116"]
        HC --> HC1["isNonEmptyString()<br/>types.ts:117"]
        HC1 --> HC2["new Date() not NaN<br/>types.ts:118-119"]

        HD["isNonNegativeNumber()<br/>types.ts:125"]
        HD --> HD1["typeof === 'number'<br/>>= 0 && isFinite<br/>types.ts:126"]

        HE["isValidEnrollmentAction()<br/>types.ts:132"]
        HE --> HE1["typeof === 'object'<br/>types.ts:133"]
        HE1 --> HE2["hasDangerousKeys()<br/>types.ts:134"]
        HE2 --> HE3["label: nonEmptyString<br/>status: finished|failed<br/>types.ts:137-138"]

        HF["isValidUserEntry()<br/>types.ts:145"]
        HF --> HF1["typeof === 'object'<br/>types.ts:146"]
        HF1 --> HF2["hasDangerousKeys()<br/>types.ts:147"]
        HF2 --> HF3["optional fields: string<br/>types.ts:151-156"]
    end

    subgraph "Type Guards"
        B --> B1{"payload.event ===<br/>com.jamf...finished<br/>types.ts:54"}
        B1 -->|Yes| B2["payload is<br/>SetupManagerFinishedWebhook"]
        B1 -->|No| B3["payload is NOT<br/>SetupManagerFinishedWebhook"]

        C --> C1{"payload.event ===<br/>com.jamf...started<br/>types.ts:63"}
        C1 -->|Yes| C2["payload is<br/>SetupManagerStartedWebhook"]
        C1 -->|No| C3["payload is NOT<br/>SetupManagerStartedWebhook"]
    end
```

## Callers

### `validateWebhookPayload()` Callers

| File | Line | Context |
|------|------|---------|
| `src/index.ts` | 358 | Webhook handler - validates incoming POST |

### `isFinishedWebhook()` Callers

| File | Line | Context |
|------|------|---------|
| `src/events.ts` | 46 | Filters for finished webhooks |
| `src/components/dashboard/EventsTable.tsx` | 145, 295 | Row rendering |
| `src/components/dashboard/EventsChart.tsx` | 122 | Filters for chart |
| `src/components/dashboard/App.tsx` | 164, 191, 192 | Filter logic |
| `src/components/dashboard/ActionsChart.tsx` | 24 | Filters for chart |
| `src/hooks/useWebSocket.ts` | 131 | Stats computation |

### `isStartedWebhook()` Callers

**None found** — appears unused in production code.

## Security Features

1. **Prototype pollution guard**: `hasDangerousKeys()` rejects `__proto__`, `constructor`, `prototype`
2. **Nested object validation**: `isValidEnrollmentAction()` and `isValidUserEntry()` also check for dangerous keys
3. **Timestamp validation**: Prevents invalid date injection
4. **Type narrowing**: Type guards enable safe property access after validation
