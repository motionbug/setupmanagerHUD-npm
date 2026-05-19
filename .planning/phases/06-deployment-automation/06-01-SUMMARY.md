---
phase: 06-deployment-automation
plan: 01
subsystem: starter-template
tags: [github-actions, deployment, cloudflare, ci-cd]
dependency_graph:
  requires: []
  provides:
    - defensive-deployment-workflow
    - starter-ci-cd
  affects:
    - starter/.github/workflows/deploy.yml
tech_stack:
  added: []
  patterns:
    - defensive-gates
    - path-filtered-triggers
    - conditional-secret-sync
key_files:
  created:
    - starter/.github/workflows/deploy.yml
  modified: []
decisions:
  - D-01: paths filter prevents crash-loop paradox
  - D-02: secrets check gate validates configuration early
  - D-03: D1 placeholder check prevents cryptic migration errors
  - D-06: triggers on wrangler.toml AND package.json
  - D-07: workflow_dispatch enables manual first deploy
  - D-08: separate steps for migrations and deploy
  - D-10: npm ci before migrations ensures postinstall syncs migrations
  - D-11: WEBHOOK_TOKEN as optional secret
  - D-12: echo pipe pattern for wrangler secret put
  - D-13: secret sync on every deploy is idempotent
metrics:
  duration: 1m
  completed: 2026-05-19T22:06:00Z
---

# Phase 06 Plan 01: GitHub Actions Workflow Summary

Defensive CI/CD workflow with secrets validation, D1 placeholder detection, migration support, and WEBHOOK_TOKEN sync.

## What Was Built

Created `starter/.github/workflows/deploy.yml` with a defensive deployment pipeline that prevents the "crash-loop paradox" where fresh template clones fail immediately due to missing configuration.

### Workflow Gates (Fail-Fast with Helpful Messages)

1. **Secrets Check Gate** - Validates CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID exist before expensive operations. Displays actionable error messages pointing to Settings > Secrets and variables > Actions.

2. **D1 Placeholder Check** - Detects if `database_id` is still the zero-UUID placeholder (`00000000-0000-0000-0000-000000000000`). Provides clear instructions: create D1 database, update wrangler.toml.

### Deployment Pipeline

After gates pass:
- Node.js 20 setup with npm cache
- `npm ci` (triggers postinstall which syncs migrations from core package)
- D1 migrations apply to remote database
- Conditional WEBHOOK_TOKEN sync (only if secret is configured)
- Deploy via cloudflare/wrangler-action@v3

### Trigger Configuration

- `workflow_dispatch` - Manual trigger for initial deployment
- `push` to `main` with `paths:` filter - Only triggers on `wrangler.toml` or `package.json` changes

## Commits

| Hash | Type | Description |
|------|------|-------------|
| f4615ef | feat | Defensive GitHub Actions workflow for starter template |

## Verification Results

- File exists: PASSED
- YAML valid: PASSED
- All required components present: PASSED
- No npm run build step (correct): PASSED

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] starter/.github/workflows/deploy.yml exists
- [x] Commit f4615ef exists in git log
