# @motionbug/setupmanagerhud-core

Real-time webhook dashboard for [Setup Manager](https://github.com/jamf/setup-manager) — monitor macOS device enrollments as they happen.

Built with React, shadcn/ui, and Cloudflare Workers.

## Quick Start

The easiest way to deploy is with the Cloudflare Deploy Button in the [main repository](https://github.com/motionbug/setupmanagerhud).

For manual setup or customization, install this package:

```bash
npm install @motionbug/setupmanagerhud-core
```

## Usage

Create a Worker entry point that re-exports the app and Durable Object:

```typescript
// src/index.ts
import { app } from '@motionbug/setupmanagerhud-core';
import type { Env } from '@motionbug/setupmanagerhud-core';

export { DashboardRoom } from '@motionbug/setupmanagerhud-core';

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env);
  },
};
```

Copy the static assets to your `public/` directory:

```bash
cp -r ./node_modules/@motionbug/setupmanagerhud-core/dist/. ./public
```

Sync the D1 migrations:

```bash
node ./node_modules/@motionbug/setupmanagerhud-core/dist-scripts/sync-migrations.js
```

Configure `wrangler.toml` with D1 and Durable Object bindings — see the [template](https://github.com/motionbug/setupmanagerhud/tree/main/packages/template) for a complete example.

## What's Included

- **Worker entry point** — Routes, webhook handling, WebSocket, Cloudflare Access JWT validation
- **Durable Object** — Real-time WebSocket hub with hibernation
- **React dashboard** — KPIs, charts, event table, filters, CSV export
- **D1 migrations** — Event persistence schema

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `WEBHOOK_TOKEN` | Yes | Shared secret for webhook authentication |
| `CF_ACCESS_AUD` | No | Cloudflare Access audience tag |
| `CF_ACCESS_TEAM_DOMAIN` | No | Cloudflare Access team domain |

## Security Scanner Alerts

Security scanners like [Socket.dev](https://socket.dev) may flag the bundled JavaScript as "high risk" due to DOM manipulation patterns. **This is a false positive.**

The flagged file (`dist/assets/index-*.js`) is the Vite-bundled React 19 frontend. Scanners detect React's reconciler doing DOM manipulation — which is its job. Socket.dev's own analysis confirms: *"no clear indicators of supply-chain malware... Risk is therefore low."*

React is bundled (not a peer dependency) because Cloudflare Workers deployments require self-contained static assets. See [Security docs](https://github.com/motionbug/setupmanagerhud/blob/main/docs/Security.md#security-scanner-alerts-npm-package) for details.

## Documentation

- [Main Repository](https://github.com/motionbug/setupmanagerhud) — Deploy button, full documentation
- [Security](https://github.com/motionbug/setupmanagerhud/blob/main/docs/Security.md) — Webhook tokens, Cloudflare Access setup
- [Configuration](https://github.com/motionbug/setupmanagerhud/blob/main/docs/Configuration.md) — D1, environment variables, wrangler.toml
- [Troubleshooting](https://github.com/motionbug/setupmanagerhud/blob/main/docs/Troubleshooting.md) — Common issues

## License

[MIT](https://github.com/motionbug/setupmanagerhud/blob/main/LICENSE)
