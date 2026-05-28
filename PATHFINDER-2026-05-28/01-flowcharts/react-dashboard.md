# React Dashboard Flowchart

## Sources Consulted

| File | Lines Read |
|------|------------|
| `src/main.tsx` | 1-14 |
| `src/components/dashboard/App.tsx` | 1-415 |
| `src/hooks/useWebSocket.ts` | 1-169 |
| `src/components/dashboard/Filters.tsx` | 1-245 |
| `src/components/dashboard/EventsTable.tsx` | 1-348 |
| `src/components/dashboard/KpiCards.tsx` | 1-136 |
| `src/components/dashboard/EventsChart.tsx` | 1-211 |
| `src/components/dashboard/ActionsChart.tsx` | 1-103 |
| `src/components/dashboard/ConnectionStatus.tsx` | 1-15 |
| `src/types.ts` | 1-316 |

## Flowchart

```mermaid
flowchart TD
    subgraph "App Mount"
        A["createRoot<br/>main.tsx:8"] --> B["App<br/>App.tsx:23"]
    end

    subgraph "WebSocket Connection"
        B --> C["useWebSocket<br/>useWebSocket.ts:15"]
        C --> D["connect<br/>useWebSocket.ts:26"]
        D --> E["new WebSocket /ws<br/>useWebSocket.ts:28"]
        E --> F["ws.onopen<br/>useWebSocket.ts:31"]
        F --> G["send request-history<br/>useWebSocket.ts:34"]
    end

    subgraph "WebSocket Messages"
        E --> H["ws.onmessage<br/>useWebSocket.ts:37"]
        H --> I{"message.type<br/>useWebSocket.ts:40"}
        I -->|history| J["setState events<br/>useWebSocket.ts:48"]
        I -->|setup-manager-event| K["prepend event<br/>useWebSocket.ts:57"]
        I -->|connected/pong| L["no-op<br/>useWebSocket.ts:64"]
    end

    subgraph "Health Check"
        C --> M["fetch /api/health<br/>useWebSocket.ts:89"]
        M --> N["setState health<br/>useWebSocket.ts:96"]
    end

    subgraph "Stats Computation"
        J --> O["useMemo stats<br/>useWebSocket.ts:125"]
        K --> O
        O --> P["return Stats<br/>useWebSocket.ts:157"]
    end

    subgraph "Config Fetch"
        B --> Q["fetch /api/config<br/>App.tsx:61"]
        Q --> R["setConfig<br/>App.tsx:66"]
    end

    subgraph "Archive Toggle"
        B --> S["showArchived state<br/>App.tsx:26"]
        S -->|true| T["fetch /api/events?archived<br/>App.tsx:41"]
        T --> U["setArchivedEvents<br/>App.tsx:46"]
    end

    subgraph "Event Selection"
        J --> V["events = wsEvents or archivedEvents<br/>App.tsx:56"]
        U --> V
    end

    subgraph "Filter State"
        B --> W["filters state<br/>App.tsx:30"]
        W --> X["Filters component<br/>Filters.tsx:38"]
        X --> Y["onFiltersChange<br/>App.tsx:277"]
        Y --> W
    end

    subgraph "Event Filtering"
        V --> Z["filteredEvents useMemo<br/>App.tsx:153"]
        W --> Z
    end

    subgraph "Archive Operations"
        B --> AA["handleArchive callback<br/>App.tsx:72"]
        AA --> AB["PATCH /api/events/:id/archive<br/>App.tsx:82"]
        AB -->|success| AC["setHiddenEventIds<br/>App.tsx:93"]
        AB -->|failure| AD["rollback + toast.error<br/>App.tsx:119"]
    end

    subgraph "Display Components"
        P --> AE["KpiCards<br/>KpiCards.tsx:20"]
        Z --> AF["EventsTable<br/>EventsTable.tsx:87"]
        Z --> AG["EventsChart<br/>EventsChart.tsx:31"]
        Z --> AH["ActionsChart<br/>ActionsChart.tsx:21"]
        C --> AI["ConnectionStatus<br/>ConnectionStatus.tsx:5"]
    end

    subgraph "KpiCards Interaction"
        AE --> AJ["onFailedActionsClick<br/>KpiCards.tsx:68"]
        AJ --> AK["setFilters failed<br/>App.tsx:248"]
        AK --> W
    end

    subgraph "EventsTable Interaction"
        AF --> AL["onArchive prop<br/>EventsTable.tsx:84"]
        AL --> AA
    end

    subgraph "Filters Interaction"
        X --> AM["onShowArchivedChange<br/>Filters.tsx:186"]
        AM --> S
        X --> AN["handleExport CSV/JSON<br/>Filters.tsx:57"]
    end

    subgraph "Reconnection"
        E --> AO["ws.onclose<br/>useWebSocket.ts:70"]
        AO --> AP["setTimeout reconnect<br/>useWebSocket.ts:77"]
        AP --> D
    end
```

## External Dependencies (Backend Calls)

| Endpoint | Method | Called From | Purpose |
|----------|--------|-------------|---------|
| `/ws` | WebSocket | `useWebSocket.ts:28` | Real-time event stream |
| `/api/health` | GET | `useWebSocket.ts:89` | Health check |
| `/api/config` | GET | `App.tsx:61` | App configuration |
| `/api/events?archived=true` | GET | `App.tsx:41` | Fetch archived events |
| `/api/events/:id/archive` | PATCH | `App.tsx:82` | Archive/unarchive event |

## WebSocket Message Types

| Type | Direction | Purpose |
|------|-----------|---------|
| `request-history` | Client → Server | Request event history |
| `history` | Server → Client | Initial event list (up to 200) |
| `setup-manager-event` | Server → Client | New event broadcast |
| `connected` | Server → Client | Connection confirmation |
| `ping` / `pong` | Bidirectional | Keep-alive |

## Data Flow Summary

1. App mounts → establishes WebSocket connection
2. WebSocket receives history → populates events state
3. New events broadcast → prepended to events
4. Filters applied via useMemo → filteredEvents
5. Components render filteredEvents
6. Archive operations use optimistic updates with rollback
