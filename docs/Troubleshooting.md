# Troubleshooting

Common issues and their solutions. Each section follows the format: Problem, Cause, Solution.

---

## Webhook Issues

### Webhooks return 401 Unauthorized

**Problem:** Setup Manager devices receive 401 errors when posting to `/webhook`.

**Cause:** The token in your Setup Manager plist doesn't match the `WEBHOOK_TOKEN` configured on your Worker, or the device is not sending an `Authorization` header.

**Solution:**

1. Verify your Worker has a secret set:
   ```bash
   npx wrangler secret list
   # Should show: WEBHOOK_TOKEN
   ```

2. If missing, set it:
   ```bash
   npx wrangler secret put WEBHOOK_TOKEN
   ```

3. Verify your plist `token` value matches **exactly** (including any trailing whitespace)

4. Redeploy the configuration profile to your devices

5. Test manually:
   ```bash
   curl -X POST https://your-worker.workers.dev/webhook \
     -H "Authorization: Bearer your-token-here" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","event":"com.jamf.setupmanager.started","timestamp":"2025-01-01T00:00:00Z","started":"2025-01-01T00:00:00Z","modelName":"Test Mac","modelIdentifier":"Mac15,3","macOSBuild":"24A335","macOSVersion":"15.0","serialNumber":"TEST001","setupManagerVersion":"2.0.0"}'
   ```

See [Security](Security.md) for complete webhook token setup.

---

### Webhooks return 403 Forbidden

**Problem:** All webhook POSTs are blocked with 403 errors.

**Cause:** Cloudflare Access is protecting the `/webhook` path without a bypass policy.

**Solution:**

1. In Cloudflare Zero Trust, go to **Access -> Applications**
2. Open your Setup Manager HUD application
3. Go to the **Policies** tab
4. Add a new policy:
   - Policy name: `Bypass webhook`
   - Action: `Bypass`
   - Include: `Everyone`
   - Path: `/webhook`
5. **Drag this policy ABOVE the Allow policy** (Bypass policies must be evaluated first)
6. Save

Test:
```bash
curl -X POST https://your-worker.workers.dev/webhook \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","event":"com.jamf.setupmanager.started",...}'
# Should return 200, not 403
```

---

### Webhooks return 503 Service Unavailable

**Problem:** Webhook POSTs return a 503 configuration error.

**Cause:** D1 database is not bound to the Worker, migrations have not been applied, or the binding name is incorrect.

**Solution:**

1. Check health endpoint:
   ```bash
   curl https://your-worker.workers.dev/api/health
   ```

2. If `d1` shows `not configured` or `error`:
   - Verify D1 database exists in Cloudflare dashboard
   - Verify binding variable name is exactly `DB`
   - Verify migrations have been applied
   - Rebind via dashboard or `wrangler.toml`

See [Configuration - D1 Database](Configuration.md#d1-database-required) for setup steps.

---

## WebSocket Issues

### Dashboard shows "Disconnected" or events don't appear in real-time

**Problem:** Dashboard connects but shows "Disconnected" status, or new events don't appear without refreshing.

**Cause:** WebSocket connection failed or was blocked.

**Solution:**

1. Check browser console for WebSocket errors (F12 -> Console)

2. If using Cloudflare Access, verify the Access cookie is valid:
   - Open dashboard in browser (should prompt for login)
   - After login, WebSocket should connect

3. Check if a proxy or firewall is blocking WebSocket connections:
   ```bash
   # Test WebSocket upgrade
   curl -i -N \
     -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
     https://your-worker.workers.dev/ws
   # Should return 101 Switching Protocols
   ```

4. If on corporate network, try from a different network to isolate the issue

---

### Events appear briefly then disappear

**Problem:** Events show up in the dashboard, then vanish after a few seconds.

**Cause:** Dashboard is receiving events from the WebSocket but failing to persist them in component state.

**Solution:**

1. Open browser console (F12) and look for JavaScript errors
2. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. Clear browser cache and local storage for the domain
4. Try a different browser to isolate browser-specific issues

---

## D1 Database Issues

### Health check shows "d1": "not configured"

**Problem:** The `/api/health` endpoint shows D1 as not configured.

**Cause:** D1 database binding is missing from the Worker.

**Solution:**

1. Verify D1 database exists:
   ```bash
   npx wrangler d1 list
   ```

2. Verify binding in `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "setupmanagerhud-events"
   database_id = "your-d1-database-id"
   ```

3. Redeploy:
   ```bash
   npm run deploy
   ```

4. Or rebind via dashboard (see [Configuration - D1 Database](Configuration.md#d1-database-required))

---

### Health check shows "d1": "error"

**Problem:** D1 is bound but returning errors.

**Cause:** Database ID mismatch, database was deleted, or migrations have not been applied.

**Solution:**

1. List databases and verify ID:
   ```bash
   npx wrangler d1 list
   ```

2. Compare with `wrangler.toml` - IDs must match exactly

3. Apply migrations:
   ```bash
   npx wrangler d1 migrations apply DB --remote
   ```

4. If the database was deleted, create a new one and update the binding

---

### Dashboard shows a storage warning

**Problem:** The dashboard loads but shows "Storage configuration needs attention."

**Cause:** `/api/health` reports D1 or Durable Objects as degraded.

**Solution:**

1. Open the health endpoint after authenticating through Cloudflare Access:
   ```bash
   curl https://your-worker.workers.dev/api/health
   ```

2. Verify `"d1": "connected"`.

3. Verify `"durable_objects": "connected"`.

4. If D1 is degraded, recheck the `DB` binding and apply migrations with `--remote`.

5. If Durable Objects are degraded, verify the `DASHBOARD_ROOM` binding and migration in `wrangler.toml`.

---

## Cloudflare Access Issues

### Dashboard redirects to login loop

**Problem:** Accessing the dashboard redirects to Cloudflare Access login, but after logging in, redirects back to login again.

**Cause:** JWT validation in the Worker is failing, possibly due to misconfigured `CF_ACCESS_AUD` or `CF_ACCESS_TEAM_DOMAIN`.

**Solution:**

1. Verify `wrangler.toml` has correct values:
   ```toml
   [vars]
   CF_ACCESS_AUD = "your-audience-tag"
   CF_ACCESS_TEAM_DOMAIN = "your-team.cloudflareaccess.com"
   ```

2. Find your Audience tag:
   - Zero Trust dashboard -> Access -> Applications
   - Click your application -> Overview tab
   - Copy the "Application Audience (AUD) Tag"

3. Find your Team domain:
   - Zero Trust dashboard -> Settings -> Custom Pages
   - Your team domain is shown at the top

4. Redeploy after updating:
   ```bash
   npm run deploy
   ```

5. If you test with `curl`, expect unauthenticated dashboard/API requests to return `302` from Cloudflare Access or `403` from the Worker. A `403` response should still include the standard security headers.

---

### Dashboard accessible without login (unprotected)

**Problem:** Dashboard loads without prompting for Cloudflare Access login.

**Cause:** Cloudflare Access is optional. If you expected a login prompt, the Access application is not configured, or `CF_ACCESS_*` variables are not set for Worker-side JWT validation.

**Solution:**

1. Verify Access application exists:
   - Zero Trust dashboard -> Access -> Applications
   - Should see your application listed

2. Verify `wrangler.toml` has both variables set (not empty):
   ```toml
   [vars]
   CF_ACCESS_AUD = "..."  # Not empty
   CF_ACCESS_TEAM_DOMAIN = "..."  # Not empty
   ```

3. Redeploy if variables were missing

See [Security - Cloudflare Access](Security.md#cloudflare-access-optional-dashboard-authentication) for complete setup.

---

## General Issues

### Events not appearing on dashboard

**Problem:** Webhooks return 200 but events don't show on dashboard.

**Cause:** Multiple possible causes - use this checklist.

**Solution:**

1. **Check WebSocket connection:** Dashboard should show "Connected" status

2. **Check D1 storage:** Health endpoint should show `"d1": "connected"`

3. **Check browser console:** Look for JavaScript errors

4. **Check event payload:** Ensure webhooks have all required fields:
   - `name`, `event`, `timestamp`, `started` (for started events)
   - `name`, `event`, `timestamp`, `started`, `finished` (for finished events)

5. **Test with curl:** Send a test event and watch the dashboard:
   ```bash
   curl -X POST https://your-worker.workers.dev/webhook \
     -H "Authorization: Bearer your-token-here" \
     -H "Content-Type: application/json" \
     -d '{"name":"Started","event":"com.jamf.setupmanager.started","timestamp":"2025-01-01T00:00:00Z","started":"2025-01-01T00:00:00Z","modelName":"Test Mac","modelIdentifier":"Mac15,3","macOSBuild":"24A335","macOSVersion":"15.0","serialNumber":"TEST001","setupManagerVersion":"2.0.0"}'
   ```

---

### Need more help?

- Check the [GitHub Issues](https://github.com/jamf/setup-manager-HUD/issues) for similar problems
- Open a new issue with your error details, health check output, and relevant logs
