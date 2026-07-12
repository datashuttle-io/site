// Ambient Cloudflare Workers types for this repo's first Worker.
//
// @cloudflare/workers-types is not installed here — declare only the
// minimal shapes worker/index.ts needs. Request/Response/URL come from the
// "DOM" lib already included by tsconfig.worker.json.

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  // Bound automatically by the `assets` config in wrangler.jsonc.
  ASSETS: Fetcher;
  // Wrangler secret (`wrangler secret put SUPPORT_PLANE_SITE_API_KEY`) — not
  // read by this skeleton; wired starting 30-03.
  SUPPORT_PLANE_SITE_API_KEY: string;
}
