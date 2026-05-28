# Setup Manager HUD

A real-time webhook dashboard for [Setup Manager](https://github.com/jamf/setup-manager) that helps you monitor macOS device enrollments as they happen.

Built with React, shadcn/ui, and Cloudflare Workers.

| Dark Mode | Light Mode |
|-----------|------------|
| ![Dark Mode](./docs/setupmanagerhud-dark.png) | ![Light Mode](./docs/setupmanagerhud-light.png) |

## Deploy

**This is the npm package source repository.** To deploy Setup Manager HUD, use the starter repo:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/motionbug/setupmanagerhud-starter)

See [setupmanagerhud-starter](https://github.com/motionbug/setupmanagerhud-starter) for deployment instructions and upgrade workflow.

## About This Repository

This repo contains the source code for the `@motionbug/setupmanagerhud-core` npm package. The package includes:

- Worker entry point and Durable Object
- Pre-built React dashboard
- D1 migrations
- Sync scripts for assets and migrations

**Do not deploy directly from this repo.** Use the [starter template](https://github.com/motionbug/setupmanagerhud-starter) instead, which imports this package and provides the proper upgrade path.

## For Contributors

Development commands and architecture details are in [CLAUDE.md](CLAUDE.md).

```bash
npm install
npm run dev          # Frontend on :5173
npm run dev:worker   # Full stack on :8787
npm test             # Run tests
```

## Documentation

- [Configuration](docs/Configuration.md) - D1, environment variables, Cloudflare Access
- [Security](docs/Security.md) - Webhook tokens, JWT validation, rate limiting
- [Troubleshooting](docs/Troubleshooting.md) - Common issues and solutions

## License

[MIT](LICENSE)
