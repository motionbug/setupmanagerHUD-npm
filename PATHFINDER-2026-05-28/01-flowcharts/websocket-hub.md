# WebSocket Hub (Durable Object) Flowchart

## Sources Consulted

| File | Line Range | Purpose |
|------|-----------|---------|
| `src/DashboardRoom.ts` | 1-124 | Entire Durable Object implementation |
| `src/events.ts` | 1-241 | External dependency `fetchEvents()` for history |
| `src/index.ts` | 1-602 | Worker entry points that invoke DashboardRoom |

## Flowchart

```mermaid
flowchart TD
    subgraph "Entry Points (index.ts)"
        WS_ENTRY["handleWebSocket()<br/>index.ts:532"]
        WEBHOOK_ENTRY["handleWebhook()<br/>index.ts:309"]
        HEALTH_ENTRY["handleHealth()<br/>index.ts:443"]
    end

    subgraph "DashboardRoom Durable Object"
        FETCH["fetch(request)<br/>DashboardRoom.ts:17"]
        
        subgraph "Route: /broadcast (POST)"
            BROADCAST_CHECK{"pathname === '/broadcast'<br/>DashboardRoom.ts:21"}
            GET_MSG["request.text()<br/>DashboardRoom.ts:22"]
            GET_WS_BROADCAST["state.getWebSockets()<br/>DashboardRoom.ts:23"]
            BROADCAST_LOOP["for each ws<br/>DashboardRoom.ts:27"]
            WS_SEND_BROADCAST["ws.send(message)<br/>DashboardRoom.ts:29"]
            BROADCAST_ERROR["console.error()<br/>DashboardRoom.ts:32"]
            BROADCAST_RESPONSE["Response.json({broadcasted})<br/>DashboardRoom.ts:37"]
        end
        
        subgraph "Route: /connections (GET)"
            CONN_CHECK{"pathname === '/connections'<br/>DashboardRoom.ts:46"}
            GET_WS_CONN["state.getWebSockets()<br/>DashboardRoom.ts:47"]
            CONN_RESPONSE["Response.json({connections})<br/>DashboardRoom.ts:48"]
        end
        
        subgraph "Route: WebSocket Upgrade"
            WS_UPGRADE_CHECK{"Upgrade === 'websocket'<br/>DashboardRoom.ts:52"}
            CREATE_PAIR["new WebSocketPair()<br/>DashboardRoom.ts:53"]
            ACCEPT_WS["state.acceptWebSocket(server)<br/>DashboardRoom.ts:56"]
            SEND_CONNECTED["server.send({type:'connected'})<br/>DashboardRoom.ts:58"]
            CALL_HISTORY["sendHistory(server, 200)<br/>DashboardRoom.ts:66"]
            HISTORY_ERROR["console.error()<br/>DashboardRoom.ts:67"]
            WS_RESPONSE["Response(101, webSocket)<br/>DashboardRoom.ts:70"]
        end
        
        NOT_FOUND["Response('Not Found', 404)<br/>DashboardRoom.ts:73"]
        
        subgraph "WebSocket Message Handler"
            WS_MSG["webSocketMessage(ws, message)<br/>DashboardRoom.ts:79"]
            SIZE_CHECK{"messageLength > MAX_WS_MESSAGE_SIZE<br/>DashboardRoom.ts:86"}
            SIZE_ERROR["ws.send({type:'error'})<br/>DashboardRoom.ts:87"]
            PARSE_MSG["JSON.parse(message)<br/>DashboardRoom.ts:92"]
            PING_CHECK{"data.type === 'ping'<br/>DashboardRoom.ts:94"}
            PONG_SEND["ws.send({type:'pong'})<br/>DashboardRoom.ts:95"]
            HISTORY_CHECK{"data.type === 'request-history'<br/>DashboardRoom.ts:98"}
            CALC_LIMIT["Math.min(limit, MAX_HISTORY)<br/>DashboardRoom.ts:100"]
            CALL_HISTORY_MSG["sendHistory(ws, limit)<br/>DashboardRoom.ts:104"]
            MSG_ERROR["console.error()<br/>DashboardRoom.ts:108"]
        end
        
        subgraph "WebSocket Close/Error"
            WS_CLOSE["webSocketClose(ws, code)<br/>DashboardRoom.ts:112"]
            WS_CLOSE_CALL["ws.close(code)<br/>DashboardRoom.ts:113"]
            WS_ERROR["webSocketError(_ws, error)<br/>DashboardRoom.ts:116"]
            WS_ERROR_LOG["console.error()<br/>DashboardRoom.ts:117"]
        end
        
        subgraph "sendHistory Helper"
            SEND_HISTORY["sendHistory(ws, limit)<br/>DashboardRoom.ts:120"]
            FETCH_EVENTS["fetchEvents(env, limit)<br/>DashboardRoom.ts:121"]
            SEND_HISTORY_MSG["ws.send({type:'history'})<br/>DashboardRoom.ts:122"]
        end
    end
    
    subgraph "External: events.ts"
        EVENTS_FETCH["fetchEvents()<br/>events.ts:154"]
    end
    
    %% Entry point flows
    WS_ENTRY --> FETCH
    WEBHOOK_ENTRY -->|"room.fetch('/broadcast')"| FETCH
    HEALTH_ENTRY -->|"room.fetch('/connections')"| FETCH
    
    %% Main routing
    FETCH --> BROADCAST_CHECK
    BROADCAST_CHECK -->|Yes| GET_MSG
    BROADCAST_CHECK -->|No| CONN_CHECK
    
    GET_MSG --> GET_WS_BROADCAST
    GET_WS_BROADCAST --> BROADCAST_LOOP
    BROADCAST_LOOP --> WS_SEND_BROADCAST
    WS_SEND_BROADCAST -->|success| BROADCAST_LOOP
    WS_SEND_BROADCAST -->|catch| BROADCAST_ERROR
    BROADCAST_ERROR --> BROADCAST_LOOP
    BROADCAST_LOOP -->|done| BROADCAST_RESPONSE
    
    CONN_CHECK -->|Yes| GET_WS_CONN
    CONN_CHECK -->|No| WS_UPGRADE_CHECK
    GET_WS_CONN --> CONN_RESPONSE
    
    WS_UPGRADE_CHECK -->|Yes| CREATE_PAIR
    WS_UPGRADE_CHECK -->|No| NOT_FOUND
    CREATE_PAIR --> ACCEPT_WS
    ACCEPT_WS --> SEND_CONNECTED
    SEND_CONNECTED --> CALL_HISTORY
    CALL_HISTORY -->|catch| HISTORY_ERROR
    CALL_HISTORY --> WS_RESPONSE
    
    %% WebSocket message handling
    WS_MSG --> SIZE_CHECK
    SIZE_CHECK -->|Yes| SIZE_ERROR
    SIZE_CHECK -->|No| PARSE_MSG
    PARSE_MSG --> PING_CHECK
    PING_CHECK -->|Yes| PONG_SEND
    PING_CHECK -->|No| HISTORY_CHECK
    HISTORY_CHECK -->|Yes| CALC_LIMIT
    CALC_LIMIT --> CALL_HISTORY_MSG
    PARSE_MSG -->|catch| MSG_ERROR
    
    %% Close/Error handlers
    WS_CLOSE --> WS_CLOSE_CALL
    WS_ERROR --> WS_ERROR_LOG
    
    %% sendHistory internals
    CALL_HISTORY --> SEND_HISTORY
    CALL_HISTORY_MSG --> SEND_HISTORY
    SEND_HISTORY --> FETCH_EVENTS
    FETCH_EVENTS --> EVENTS_FETCH
    FETCH_EVENTS --> SEND_HISTORY_MSG
```

## External Dependencies

| Dependency | File:Line | Called From | Purpose |
|------------|-----------|-------------|---------|
| `fetchEvents()` | `events.ts:154` | `DashboardRoom.ts:121` | Retrieves stored events from D1 for history |
| `StoredEvent` type | `types.ts` | `DashboardRoom.ts:1` | Type import for event structure |

## Side Effects

1. **WebSocket sends** (broadcast messages to all connected clients)
2. **WebSocket sends** (connected confirmation, history data, pong response, error message)
3. **Hibernation state** via `state.acceptWebSocket()` (enables Durable Object hibernation API)
4. **D1 database reads** via `fetchEvents()`
