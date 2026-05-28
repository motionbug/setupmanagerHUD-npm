# Setup Manager HUD Documentation

Extended documentation for Setup Manager HUD deployment, security, and troubleshooting.

| Page | Description |
|------|-------------|
| [Security](Security.md) | Required webhook token setup, optional Cloudflare Access, rate limiting |
| [Configuration](Configuration.md) | D1 database, environment variables, wrangler.toml |
| [Troubleshooting](Troubleshooting.md) | Common issues and debugging tips |
| [Design Principles](design-principles.md) | UI/UX guidelines for the dashboard |

For quick start and deployment, see the main [README](../README.md).

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
