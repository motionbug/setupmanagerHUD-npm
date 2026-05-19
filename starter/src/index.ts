import { app } from '@motionbug/setupmanagerhud-core';
import type { Env } from '@motionbug/setupmanagerhud-core';

// CRITICAL: Re-export at root level for Wrangler to bind
export { DashboardRoom } from '@motionbug/setupmanagerhud-core';

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env);
  },
};
