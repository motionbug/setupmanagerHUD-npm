# Roadmap: Setup Manager HUD

## Milestones

- [x] **v1.0 Documentation Update** - Phases 1-3 (shipped 2026-04-25) - [archive](milestones/v1.0-ROADMAP.md)
- [ ] **v1.1 NPM Package Upgrade Path** - Phases 4-6 (in progress)

## Phases

<details>
<summary>v1.0 Documentation Update (Phases 1-3) - SHIPPED 2026-04-25</summary>

- [x] Phase 1: Wiki Foundation (1/1 plans) - completed 2026-04-19
- [x] Phase 2: Wiki Content (2/2 plans) - completed 2026-04-20
- [x] Phase 3: README Integration (1/1 plan) - completed 2026-04-25

</details>

### v1.1 NPM Package Upgrade Path (In Progress)

**Milestone Goal:** Enable zero-conflict upgrades by extracting core app into an NPM package that administrators install as a dependency.

- [ ] **Phase 4: Package Extraction** - Bundle core app as NPM package with config interface
- [ ] **Phase 5: Starter Template** - Create minimal template repo with postinstall sync
- [ ] **Phase 6: Deployment Automation** - Pages deployment workflow and documentation

## Phase Details

### Phase 4: Package Extraction
**Goal**: Core app is bundled as an installable NPM package with clean configuration API
**Depends on**: Phase 3
**Requirements**: PKG-01, PKG-02
**Success Criteria** (what must be TRUE):
  1. Running `npm install @motionbug/setupmanagerhud-core` installs a working package
  2. Package exports a configuration function that accepts Cloudflare bindings
  3. Built React frontend is included in the package
  4. Worker entry point is included and functional
**Plans**: 3 plans
Plans:
- [x] 04-01-PLAN.md — Monorepo structure and tsup build configuration
- [x] 04-02-PLAN.md — Dual export refactor and migration sync script
- [ ] 04-03-PLAN.md — Test consumer validation

### Phase 5: Starter Template
**Goal**: Administrators can clone a minimal template and deploy with their config
**Depends on**: Phase 4
**Requirements**: TPL-01, TPL-02, TPL-03, TPL-04
**Success Criteria** (what must be TRUE):
  1. Starter template contains only essential files (package.json, wrangler.toml, entry point)
  2. Running `npm install` in template copies D1 migrations from node_modules to ./migrations
  3. `npm run update` and `npm run deploy` commands work as expected
  4. postinstall script works on Windows (via shx)
**Plans**: TBD
**UI hint**: yes

### Phase 6: Deployment Automation
**Goal**: Administrators can deploy via GitHub Actions with one-click setup
**Depends on**: Phase 5
**Requirements**: DEP-01, DEP-02, DEP-03, DEP-04
**Success Criteria** (what must be TRUE):
  1. GitHub Actions workflow deploys to Cloudflare Pages successfully
  2. GitHub Actions workflow runs D1 migrations before deployment
  3. Deploy documentation walks admin through complete setup
  4. "Deploy via GitHub Template" workflow guides user to create repo, input secrets (CLOUDFLARE_API_TOKEN, etc.), and auto-triggers migration + deployment
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 4 -> 5 -> 6

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Wiki Foundation | v1.0 | 1/1 | Complete | 2026-04-19 |
| 2. Wiki Content | v1.0 | 2/2 | Complete | 2026-04-20 |
| 3. README Integration | v1.0 | 1/1 | Complete | 2026-04-25 |
| 4. Package Extraction | v1.1 | 2/3 | Executing | - |
| 5. Starter Template | v1.1 | 0/? | Not started | - |
| 6. Deployment Automation | v1.1 | 0/? | Not started | - |

---
*Last updated: 2026-05-19 after Phase 04-02 execution*
