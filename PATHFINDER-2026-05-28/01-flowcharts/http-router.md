# HTTP Router and Security Flowchart

## Sources Consulted

| File | Lines Read |
|------|------------|
| `src/index.ts` | 1-602 (entire file) |

## Flowchart

```mermaid
flowchart TD
    subgraph Entry["Entry Point"]
        A["app.fetch()<br/>index.ts:543"]
    end
    
    subgraph URLParsing["URL Parsing"]
        B["Parse URL<br/>index.ts:544"]
    end
    
    subgraph OptionsHandler["OPTIONS Handler"]
        C{"request.method === 'OPTIONS'?<br/>index.ts:546"}
        D["getCorsHeaders()<br/>index.ts:78-95"]
        E["withSecurityHeaders()<br/>index.ts:120-131"]
        F["Return 200 with CORS<br/>index.ts:547-550"]
    end
    
    subgraph WebhookRoute["Webhook Route (No Access Check)"]
        G{"/webhook && POST?<br/>index.ts:553"}
        H["handleWebhook()<br/>index.ts:309-387"]
    end
    
    subgraph AccessValidation["Cloudflare Access JWT Validation"]
        I["validateAccessJwt()<br/>index.ts:171-279"]
        I1["Check CF_ACCESS_AUD & TEAM_DOMAIN<br/>index.ts:175-179"]
        I2["Get Cf-Access-Jwt-Assertion<br/>index.ts:181-184"]
        I3["Decode JWT parts<br/>index.ts:188-194"]
        I4["Validate audience (aud)<br/>index.ts:197-203"]
        I5["Validate exp claim<br/>index.ts:209-215"]
        I6["Validate nbf claim<br/>index.ts:218-220"]
        I7["Validate issuer (iss)<br/>index.ts:223-226"]
        I8["Fetch JWKs from team domain<br/>index.ts:229-239"]
        I9["Find matching key (kid)<br/>index.ts:242-246"]
        I10["Verify RS256 signature<br/>index.ts:249-272"]
        J["withSecurityHeaders()<br/>index.ts:559"]
    end
    
    subgraph ProtectedRoutes["Protected Routes"]
        K{"/api/events && GET?<br/>index.ts:561"}
        L["handleEvents()<br/>index.ts:390-421"]
        
        M{"/api/events/:id/archive && PATCH?<br/>index.ts:564"}
        N["handleArchiveToggle()<br/>index.ts:424-432"]
        
        O{"/api/stats && GET?<br/>index.ts:569"}
        P["handleStats()<br/>index.ts:435-440"]
        
        Q{"/api/health && GET?<br/>index.ts:572"}
        R["handleHealth()<br/>index.ts:443-493"]
        
        S{"/api/config && GET?<br/>index.ts:575"}
        T["handleConfig()<br/>index.ts:496-529"]
        
        U{"/ws?<br/>index.ts:578"}
        V["handleWebSocket()<br/>index.ts:532-539"]
    end
    
    subgraph AssetFallback["Static Asset Fallback"]
        W{"env.ASSETS exists?<br/>index.ts:582"}
        X["env.ASSETS.fetch()<br/>index.ts:583"]
        Y["withSecurityHeaders()<br/>index.ts:584"]
    end
    
    subgraph NotFound["404 Handler"]
        Z["Return 404<br/>index.ts:587"]
    end
    
    A --> B
    B --> C
    C -->|Yes| D
    D --> E
    E --> F
    
    C -->|No| G
    G -->|Yes| H
    
    G -->|No| I
    I --> I1
    I1 -->|Not configured| SKIP["Skip validation<br/>index.ts:179"]
    I1 -->|Configured| I2
    I2 -->|Missing| DENY1["403 Missing token"]
    I2 -->|Present| I3
    I3 --> I4 --> I5 --> I6 --> I7 --> I8 --> I9 --> I10
    I10 -->|Invalid| DENY10["403 Invalid signature"]
    I10 -->|Valid| PASS["null (valid)<br/>index.ts:274"]
    
    SKIP --> K
    PASS --> K
    DENY1 --> J
    DENY10 --> J
    
    K -->|Yes| L
    K -->|No| M
    M -->|Yes| N
    M -->|No| O
    O -->|Yes| P
    O -->|No| Q
    Q -->|Yes| R
    Q -->|No| S
    S -->|Yes| T
    S -->|No| U
    U -->|Yes| V
    U -->|No| W
    W -->|Yes| X
    X --> Y
    W -->|No| Z
```

## Route Summary

| Route | Method | Handler | Access Protected | Line |
|-------|--------|---------|------------------|------|
| `OPTIONS *` | OPTIONS | CORS preflight | No | 546-550 |
| `/webhook` | POST | `handleWebhook()` | No (token auth) | 553-554 |
| `/api/events` | GET | `handleEvents()` | Yes | 561-562 |
| `/api/events/:id/archive` | PATCH | `handleArchiveToggle()` | Yes | 564-567 |
| `/api/stats` | GET | `handleStats()` | Yes | 569-570 |
| `/api/health` | GET | `handleHealth()` | Yes | 572-573 |
| `/api/config` | GET | `handleConfig()` | Yes | 575-576 |
| `/ws` | GET | `handleWebSocket()` | Yes | 578-579 |
| `*` (fallback) | * | Static assets or 404 | Yes | 582-587 |

## Security Middleware

1. **SECURITY_HEADERS** (lines 32-70): CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
2. **CORS** (lines 78-95): Same-origin only
3. **JWT Validation** (lines 171-279): Cloudflare Access JWT verification with RS256 signature
4. **Webhook Token Auth** (lines 327-348): Constant-time HMAC-SHA256 comparison

## External Dependencies

| Dependency | File | Called From | Purpose |
|------------|------|-------------|---------|
| `validateWebhookPayload()` | `src/types.ts` | `handleWebhook():358` | Validates webhook payload |
| `insertEvent()` | `src/events.ts` | `handleWebhook():377` | Persists event to D1 |
| `fetchEvents()` | `src/events.ts` | `handleEvents():419` | Retrieves events from D1 |
| `toggleArchive()` | `src/events.ts` | `handleArchiveToggle():427` | Toggles archive status |
| `fetchEventStats()` | `src/events.ts` | `handleStats():438` | Retrieves aggregated stats |
| `DashboardRoom` | `src/DashboardRoom.ts` | Multiple handlers | Durable Object for WebSocket |
