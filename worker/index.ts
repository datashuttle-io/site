// Worker entry for datashuttle-site. Routes /api/* first (per wrangler.jsonc's
// `run_worker_first`), falls back to the static SPA for everything else.
//
// The two /api routes are thin proxies onto the support-plane's site API
// (worker/plane-client.ts holds the HMAC signing + secret custody). This
// file's job is: dispatch, translate plane errors to generic customer-facing
// messages (T-30-04), forward the Idempotency-Key verbatim (T-30-08), and
// never let a client-supplied `product` field reach the plane (T-30-02).

import { callPlane } from './plane-client'

interface TenantOrderClientBody {
  cloud_provider?: string
  region?: string
  tier?: string
  contact_email?: string
  company?: string
  notes?: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/region-catalog' && request.method === 'GET') {
      return handleRegionCatalog(env)
    }

    if (url.pathname === '/api/tenant-order' && request.method === 'POST') {
      return handleTenantOrder(request, env)
    }

    // Not an API route this Worker owns — fall back to the static SPA.
    return env.ASSETS.fetch(request)
  },
}

async function handleRegionCatalog(env: Env): Promise<Response> {
  const planeRes = await callPlane({ env, method: 'GET', planePath: '/api/region-catalog' })

  if (!planeRes.ok) {
    return genericErrorResponse(planeRes.status, 'Could not load regions')
  }

  let data: { regions?: unknown }
  try {
    data = (await planeRes.json()) as { regions?: unknown }
  } catch {
    return genericErrorResponse(502, 'Could not load regions')
  }

  // Relay only the safe { regions } shape — never any other field the plane
  // might have included.
  return Response.json(
    { regions: data.regions ?? [] },
    { headers: { 'Cache-Control': 'public, max-age=60' } },
  )
}

async function handleTenantOrder(request: Request, env: Env): Promise<Response> {
  let clientBody: TenantOrderClientBody
  try {
    clientBody = (await request.json()) as TenantOrderClientBody
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Never trust or forward a client-supplied `product` — this site only
  // ever orders datashuttle. The plane's own auth.key.product check is a
  // second line of defense (T-30-02), not the primary one.
  const planeBody = {
    product: 'datashuttle',
    cloud_provider: clientBody.cloud_provider,
    region: clientBody.region,
    tier: clientBody.tier,
    contact_email: clientBody.contact_email,
    company: clientBody.company,
    notes: clientBody.notes,
  }
  const rawBody = JSON.stringify(planeBody)

  // Forward the client's Idempotency-Key verbatim so a client-side retry of
  // the SAME submit dedupes at the plane; mint one only if the client
  // omitted it entirely (defensive fallback — the browser is expected to
  // always send one per 30-04).
  const idempotencyKey = request.headers.get('Idempotency-Key') ?? crypto.randomUUID()

  const planeRes = await callPlane({
    env,
    method: 'POST',
    planePath: '/api/tenant-requests',
    rawBody,
    idempotencyKey,
  })

  if (!planeRes.ok) {
    return genericErrorResponse(planeRes.status, 'Could not submit your order')
  }

  let data: { tenantRequestId?: string; status?: string }
  try {
    data = (await planeRes.json()) as { tenantRequestId?: string; status?: string }
  } catch {
    return genericErrorResponse(502, 'Could not submit your order')
  }

  return Response.json(
    { tenantRequestId: data.tenantRequestId, status: data.status },
    { status: planeRes.status },
  )
}

/**
 * Translate any non-2xx plane response into a generic customer-facing
 * message — never echo the plane's raw JSON body, headers, or internal
 * error detail (T-30-04).
 */
function genericErrorResponse(upstreamStatus: number, message: string): Response {
  const status = upstreamStatus === 429 ? 429 : 502
  return Response.json({ error: message }, { status })
}
