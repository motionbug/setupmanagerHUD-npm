# Setup Manager HUD

Real-time webhook dashboard for Jamf Setup Manager. Deployed to Cloudflare Workers.

[![Use this template](https://img.shields.io/badge/Use%20this%20template-238636?style=for-the-badge&logo=github)](https://github.com/motionbug/setupmanagerHUD-npm/generate)

## Deploy via GitHub Actions (Recommended)

Deploy entirely from your browser -- no local tools required.

1. **Create your repository**

   Click the "Use this template" button above to create your own copy.

2. **Create a D1 database in Cloudflare Dashboard**

   - Go to [dash.cloudflare.com](https://dash.cloudflare.com) > Workers & Pages > D1
   - Click "Create database"
   - Name it `setupmanagerhud-events`
   - Copy the **Database ID** (a UUID like `abc12345-6789-def0-1234-567890abcdef`)

3. **Update wrangler.toml with your database ID**

   In your new repository, edit `wrangler.toml` and replace the placeholder:

   ```toml
   database_id = "00000000-0000-0000-0000-000000000000"  # Replace with your real ID
   ```

   Commit the change.

4. **Add GitHub repository secrets**

   Go to Settings > Secrets and variables > Actions, then add:

   | Secret | Where to find it |
   |--------|------------------|
   | `CLOUDFLARE_API_TOKEN` | [dash.cloudflare.com](https://dash.cloudflare.com) > My Profile > API Tokens > Create Token |
   | `CLOUDFLARE_ACCOUNT_ID` | Any zone's Overview page in Cloudflare Dashboard (right sidebar) |
   | `WEBHOOK_TOKEN` | Create your own secure token for webhook authentication |

   For the API Token, use the "Edit Cloudflare Workers" template or create a custom token with Workers and D1 permissions.

5. **Trigger first deploy**

   - Go to the **Actions** tab in your repository
   - Select "Deploy to Cloudflare Workers" workflow
   - Click **Run workflow** > **Run workflow**

Your dashboard is now live at `https://setupmanagerhud.<your-subdomain>.workers.dev`

## Local Development (Optional)

For developers who want to run locally before deploying.

1. Clone your repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a D1 database (if not already created):
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

## Customization

You can customize the dashboard title and logo in `wrangler.toml`:

```toml
[vars]
APP_TITLE = "My Company HUD"
LOGO_URL = "https://example.com/logo.png"
```

See the [Configuration docs](https://github.com/motionbug/setupmanagerHUD-npm/blob/main/docs/Configuration.md) for all available options.

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

- [Security](https://github.com/motionbug/setupmanagerHUD-npm/blob/main/docs/Security.md) - Webhook tokens, Cloudflare Access, JWT validation
- [Configuration](https://github.com/motionbug/setupmanagerHUD-npm/blob/main/docs/Configuration.md) - D1 setup, environment variables, branding
- [Troubleshooting](https://github.com/motionbug/setupmanagerHUD-npm/blob/main/docs/Troubleshooting.md) - Common deployment and webhook issues

## License

[MIT](https://github.com/motionbug/setupmanagerHUD-npm/blob/main/LICENSE)
