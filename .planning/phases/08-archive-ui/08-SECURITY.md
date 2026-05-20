---
phase: 08
slug: archive-ui
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-20
---

# Phase 08 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| client->API | Fetch requests cross from browser to Worker API | Archive state toggle, eventId for archive/unarchive |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-08-01 | Information Disclosure | archived query param | accept | Archived records are not sensitive; same auth protects both views | closed |
| T-08-02 | Tampering | showArchived state | accept | Client-side state; server validates all API calls independently | closed |
| T-08-03 | Tampering | eventId in URL | mitigate | `encodeURIComponent(eventId)` at App.tsx:87 prevents path traversal; server validates eventId exists | closed |
| T-08-04 | Denial of Service | rapid archive clicks | accept | Rate limiting handled by Cloudflare WAF; archivingIds Set prevents duplicate requests | closed |
| T-08-05 | Spoofing | archive API call | mitigate | Cloudflare Access JWT validation via `validateAccessJwt()` at index.ts:558 | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-08-01 | T-08-01 | Archived records contain same data as active; no additional disclosure risk | Plan author | 2026-05-20 |
| AR-08-02 | T-08-02 | showArchived is UI-only state; all data access validated server-side | Plan author | 2026-05-20 |
| AR-08-04 | T-08-04 | Cloudflare WAF provides rate limiting; client-side Set prevents duplicate in-flight requests | Plan author | 2026-05-20 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-20 | 5 | 5 | 0 | gsd-secure-phase |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-20
