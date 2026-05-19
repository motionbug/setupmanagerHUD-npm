# Requirements: Setup Manager HUD

**Defined:** 2026-04-19
**Core Value:** Real-time visibility into macOS device enrollments

## v1.0 Requirements (SHIPPED)

### Documentation

- [x] **DOC-01**: README slimmed to essentials with wiki links
- [x] **DOC-02**: Wiki Home page with navigation
- [x] **DOC-03**: Wiki Security page (webhook token prominent)
- [x] **DOC-04**: Wiki Configuration page
- [x] **DOC-05**: Wiki Troubleshooting page

## v1.1 Requirements

Requirements for NPM Package Upgrade Path. Each maps to roadmap phases.

### NPM Package

- [ ] **PKG-01**: Core app is bundled as a single NPM package with worker entry + built React frontend
- [ ] **PKG-02**: Core exports a configuration interface (e.g., `initHUD({ d1: env.DB })`) to receive Cloudflare bindings

### Starter Template

- [x] **TPL-01**: Starter template contains minimal files (package.json, wrangler.toml, entry point)
- [x] **TPL-02**: postinstall script copies D1 migrations from node_modules to local ./migrations
- [x] **TPL-03**: npm scripts provide upgrade and deploy commands
- [x] **TPL-04**: postinstall uses cross-platform tooling (shx) for Windows compatibility

### Deployment

- [x] **DEP-01**: Package works with Cloudflare Pages deployment via GitHub Actions
- [ ] **DEP-02**: Deploy documentation guides admins through setup
- [ ] **DEP-03**: Deploy-to-Cloudflare button in starter template README
- [x] **DEP-04**: GitHub Actions workflow handles D1 migrations before deployment

## Future Requirements

Deferred to v1.2+. Tracked but not in current roadmap.

### Extensibility

- **EXT-01**: Config hooks for custom logos
- **EXT-02**: CSS theme overrides
- **EXT-03**: Feature flags for optional capabilities

### CI/CD

- **CI-01**: GitHub Actions auto-publishes to NPM on release tags

## Out of Scope

| Feature | Reason |
|---------|--------|
| Boot-time schema migration | Adds complexity; postinstall + wrangler flow is standard |
| Workers-only deployment | Pages is primary; Workers can be documented later |
| Multi-tenant support | Single-org deployment, not a SaaS product |
| API documentation | Not needed for this tool |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOC-01 | Phase 3 (v1.0) | Complete |
| DOC-02 | Phase 1 (v1.0) | Complete |
| DOC-03 | Phase 2 (v1.0) | Complete |
| DOC-04 | Phase 2 (v1.0) | Complete |
| DOC-05 | Phase 2 (v1.0) | Complete |
| PKG-01 | Phase 4 | Pending |
| PKG-02 | Phase 4 | Pending |
| TPL-01 | Phase 5 | Complete |
| TPL-02 | Phase 5 | Complete |
| TPL-03 | Phase 5 | Complete |
| TPL-04 | Phase 5 | Complete |
| DEP-01 | Phase 6 | Complete |
| DEP-02 | Phase 6 | Pending |
| DEP-03 | Phase 6 | Pending |
| DEP-04 | Phase 6 | Complete |

**Coverage:**
- v1.0 requirements: 5 total (Complete)
- v1.1 requirements: 10 total
- Mapped to phases: 10/10
- Unmapped: 0

---
*Requirements defined: 2026-04-19*
*Last updated: 2026-05-19 after 06-01-PLAN.md execution*
