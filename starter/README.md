# Setup Manager HUD

Real-time webhook dashboard for Jamf Setup Manager. Deployed to Cloudflare Workers.

## Quick Start

1. Clone this repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a D1 database:
   ```bash
   npx wrangler d1 create setupmanagerhud-events
   ```

4. Update `wrangler.toml` with your database ID:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "setupmanagerhud-events"
   database_id = "your-database-id-here"
   ```

5. Set your webhook secret:
   ```bash
   npx wrangler secret put WEBHOOK_TOKEN
   ```

6. Deploy:
   ```bash
   npm run deploy
   ```

Your dashboard is now live at `https://setupmanagerhud.<your-subdomain>.workers.dev`

## Customization

You can customize the dashboard title and logo in `wrangler.toml`:

```toml
[vars]
APP_TITLE = "My Company HUD"
LOGO_URL = "https://example.com/logo.png"
```

See the [Configuration wiki](https://github.com/motionbug/setupmanagerhud/wiki/Configuration) for all available options.

## Updating

To update to the latest version:

```bash
npm run upgrade
```

This command:
1. Updates the core package to the latest version
2. Syncs frontend assets and migrations
3. Warns if new database migrations need to be applied

If new migrations are detected, run:
```bash
npx wrangler d1 migrations apply DB --local   # for local dev
npx wrangler d1 migrations apply DB --remote  # for production
```

## Documentation

- [Security](https://github.com/motionbug/setupmanagerhud/wiki/Security) - Webhook tokens, Cloudflare Access, JWT validation
- [Configuration](https://github.com/motionbug/setupmanagerhud/wiki/Configuration) - D1 setup, environment variables, branding
- [Troubleshooting](https://github.com/motionbug/setupmanagerhud/wiki/Troubleshooting) - Common deployment and webhook issues

## License

[MIT](https://github.com/motionbug/setupmanagerhud/blob/main/LICENSE)
