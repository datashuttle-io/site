// First-ever Worker entry for datashuttle-site. Routes /api/* first (per
// wrangler.jsonc's `run_worker_first`), falls back to the static SPA for
// everything else. Real /api handlers (region-catalog, tenant-order) land
// in 30-03 — this skeleton only proves the routing shape and MUST NOT read
// or log the plane site secret bound on `env` (no secret handling yet).

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/region-catalog' && request.method === 'GET') {
      return Response.json({ error: 'not implemented' }, { status: 501 });
    }

    if (url.pathname === '/api/tenant-order' && request.method === 'POST') {
      return Response.json({ error: 'not implemented' }, { status: 501 });
    }

    // Not an API route this Worker owns — fall back to the static SPA.
    return env.ASSETS.fetch(request);
  },
};
