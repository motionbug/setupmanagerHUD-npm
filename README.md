# Setup Manager HUD

A real-time webhook dashboard for [Setup Manager](https://github.com/jamf/setup-manager) that helps you monitor macOS device enrollments as they happen.

Built with React, shadcn/ui, and Cloudflare Workers.

| Dark Mode | Light Mode |
|-----------|------------|
| ![Dark Mode](./docs/setupmanagerhud-dark.png) | ![Light Mode](./docs/setupmanagerhud-light.png) |

## Quick Start

**Deploy in one click:**

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/motionbug/setupmanagerhud-starter)

Before deploying, generate a webhook token:

```bash
openssl rand -hex 24
```

See the [starter repo](https://github.com/motionbug/setupmanagerhud-starter) for full instructions.

## Upgrading

Updates are delivered via npm. In your deployed project:

```bash
npm run upgrade
npm run deploy
```

## npm Package

This repo publishes `@motionbug/setupmanagerhud-core` to npm. The package includes:

- Worker entry point and Durable Object
- Pre-built React dashboard
- D1 migrations
- Sync scripts for assets and migrations

For custom deployments, install the package directly:

```bash
npm install @motionbug/setupmanagerhud-core
```

## Development

See [CLAUDE.md](CLAUDE.md) for development commands and architecture.

## Documentation

- [Configuration](docs/Configuration.md) - D1, environment variables, Cloudflare Access
- [Security](docs/Security.md) - Webhook tokens, JWT validation, rate limiting
- [Troubleshooting](docs/Troubleshooting.md) - Common issues and solutions

## License

[MIT](LICENSE)
