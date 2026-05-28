# NPM Publishing Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a GitHub Actions workflow that publishes `@motionbug/setupmanagerhud-core` to npm on version tag push, with local testing validation first.

**Architecture:** Tag-triggered workflow runs tests, builds, and publishes to npm. Manual local validation ensures the template works before first publish. Provenance enabled for supply chain security.

**Tech Stack:** GitHub Actions, npm, Node.js 20

---

## File Structure

| File | Purpose |
|------|---------|
| `.github/workflows/publish.yml` | Tag-triggered npm publish workflow |
| `packages/core/package.json` | Add `publishConfig` for public access |

---

### Task 1: Add publishConfig to package.json

**Files:**
- Modify: `packages/core/package.json`

- [ ] **Step 1: Add publishConfig section**

Edit `packages/core/package.json` to add `publishConfig` after the `files` array:

```json
  "files": [
    "dist",
    "dist-worker",
    "dist-scripts",
    "migrations"
  ],
  "publishConfig": {
    "access": "public"
  },
```

- [ ] **Step 2: Verify package.json is valid JSON**

Run:
```bash
cd packages/core && node -e "require('./package.json')" && echo "Valid JSON"
```
Expected: `Valid JSON`

- [ ] **Step 3: Commit**

```bash
git add packages/core/package.json
git commit -m "$(cat <<'EOF'
chore(core): add publishConfig for public npm access

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Create npm publish workflow

**Files:**
- Create: `.github/workflows/publish.yml`

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run typecheck
        working-directory: packages/core
        run: npm run typecheck

      - name: Run tests
        working-directory: packages/core
        run: npm run test:all

      - name: Build
        working-directory: packages/core
        run: npm run build

      - name: Publish to npm
        working-directory: packages/core
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 2: Verify workflow syntax**

Run:
```bash
cd /Users/rob.potvin/Git/jamf/setup-manager-HUD && cat .github/workflows/publish.yml | head -5
```
Expected: First 5 lines of the workflow file

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/publish.yml
git commit -m "$(cat <<'EOF'
ci: add npm publish workflow on version tags

Triggers on v* tags, runs typecheck and tests before publishing
to npm with provenance enabled.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Local validation - build and dry-run publish

**Files:**
- None (validation only)

- [ ] **Step 1: Run full build**

Run:
```bash
cd packages/core && npm run build
```
Expected: Build completes without errors, `dist/`, `dist-worker/`, `dist-scripts/` populated

- [ ] **Step 2: Run tests**

Run:
```bash
cd packages/core && npm run test:all
```
Expected: All tests pass

- [ ] **Step 3: Dry-run npm publish**

Run:
```bash
cd packages/core && npm publish --dry-run
```
Expected: Shows package contents, no errors, lists `dist/`, `dist-worker/`, `dist-scripts/`, `migrations/`

- [ ] **Step 4: Verify package contents**

Run:
```bash
cd packages/core && npm pack --dry-run 2>&1 | grep -E "^npm notice [0-9]"
```
Expected: Lists files that would be included (should NOT include `src/`, `node_modules/`, test files)

---

### Task 4: Local validation - test template consumption

**Files:**
- None (validation only, uses temp directory)

- [ ] **Step 1: Create a local tarball**

Run:
```bash
cd packages/core && npm pack
```
Expected: Creates `motionbug-setupmanagerhud-core-1.1.0.tgz`

- [ ] **Step 2: Create temp test directory**

Run:
```bash
mkdir -p /tmp/smhud-test && cd /tmp/smhud-test
```

- [ ] **Step 3: Initialize test project and install from tarball**

Run:
```bash
cd /tmp/smhud-test && npm init -y && npm install /Users/rob.potvin/Git/jamf/setup-manager-HUD/packages/core/motionbug-setupmanagerhud-core-1.1.0.tgz shx
```
Expected: Installs successfully

- [ ] **Step 4: Copy template files**

Run:
```bash
cd /tmp/smhud-test && cp /Users/rob.potvin/Git/jamf/setup-manager-HUD/packages/template/src/index.ts ./src/index.ts && mkdir -p src
cp /Users/rob.potvin/Git/jamf/setup-manager-HUD/packages/template/wrangler.toml ./wrangler.toml
cp /Users/rob.potvin/Git/jamf/setup-manager-HUD/packages/template/tsconfig.json ./tsconfig.json
```

- [ ] **Step 5: Run postinstall script manually**

Run:
```bash
cd /tmp/smhud-test && node ./node_modules/@motionbug/setupmanagerhud-core/dist-scripts/sync-migrations.js
```
Expected: Creates `migrations/` directory, copies `0001_create_events.sql`

- [ ] **Step 6: Verify assets copied**

Run:
```bash
cd /tmp/smhud-test && mkdir -p public && cp -r ./node_modules/@motionbug/setupmanagerhud-core/dist/. ./public && ls public/
```
Expected: Lists `index.html`, `assets/`, SVG files

- [ ] **Step 7: Verify migrations synced**

Run:
```bash
ls /tmp/smhud-test/migrations/
```
Expected: `0001_create_events.sql`

- [ ] **Step 8: Cleanup**

Run:
```bash
rm -rf /tmp/smhud-test && rm packages/core/motionbug-setupmanagerhud-core-1.1.0.tgz
```

---

### Task 5: Document NPM_TOKEN setup in README

**Files:**
- Modify: `docs/README.md` (or create if needed)

- [ ] **Step 1: Check if docs/README.md exists**

Run:
```bash
cat /Users/rob.potvin/Git/jamf/setup-manager-HUD/docs/README.md 2>/dev/null || echo "File does not exist"
```

- [ ] **Step 2: Add publishing instructions**

If `docs/README.md` exists, append to it. Otherwise create it with:

```markdown
# Development Documentation

## Publishing to npm

The `@motionbug/setupmanagerhud-core` package is published automatically when you push a version tag.

### Setup (one-time)

1. Create an npm access token at https://www.npmjs.com/settings/~/tokens
   - Select "Automation" token type
   - Copy the token (starts with `npm_`)

2. Add the token to GitHub repository secrets:
   - Go to Settings > Secrets and variables > Actions
   - Create secret named `NPM_TOKEN`
   - Paste the npm token

### Publishing a new version

1. Update version in `packages/core/package.json`
2. Commit the version bump
3. Create and push a tag:
   ```bash
   git tag v1.2.0
   git push origin v1.2.0
   ```

The GitHub Action will run tests and publish to npm automatically.

### Manual publishing (not recommended)

```bash
cd packages/core
npm run build
npm publish --access public
```
```

- [ ] **Step 3: Commit**

```bash
git add docs/README.md
git commit -m "$(cat <<'EOF'
docs: add npm publishing instructions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: First publish (manual, one-time)

**Files:**
- None (npm publish)

> **Note:** This task is for the initial publish only. After this, use tags.

- [ ] **Step 1: Verify npm login**

Run:
```bash
npm whoami
```
Expected: Your npm username

- [ ] **Step 2: Final build**

Run:
```bash
cd packages/core && npm run build
```

- [ ] **Step 3: Publish to npm**

Run:
```bash
cd packages/core && npm publish --access public
```
Expected: Package published successfully

- [ ] **Step 4: Verify publication**

Run:
```bash
npm view @motionbug/setupmanagerhud-core
```
Expected: Shows package info with version 1.1.0

- [ ] **Step 5: Tag the release**

```bash
git tag v1.1.0
git push origin v1.1.0
```

---

## Summary

After completing all tasks:
- `@motionbug/setupmanagerhud-core` is published to npm
- Future versions publish automatically on `v*` tag push
- Template consumers can `npm install @motionbug/setupmanagerhud-core`
- Publishing docs are in `docs/README.md`
