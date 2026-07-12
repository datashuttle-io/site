// HMAC v1 signer + forwarder for Worker → support-plane site calls (30-03).
//
// Mirrors support-plane/src/provision/signature.ts's verify-side recipe
// byte-for-byte:
//   signedPayload = `${timestamp}.${method}.${path}.${rawBody}`
//   signature     = base64( HMAC-SHA256(secret, signedPayload) )
// where `path` is ALWAYS the plane-side path (e.g. '/api/tenant-requests',
// '/api/region-catalog') — never the Worker's own inbound route. Signing
// happens at call-time inside callPlane(), never precomputed or memoized
// (the plane's SITE_TIMESTAMP_TOLERANCE_SECONDS window is 300s).
//
// node:crypto is available here via wrangler.jsonc's `nodejs_compat`
// compatibility flag (already set for this project).
//
// The secret (env.SUPPORT_PLANE_SITE_API_KEY) is read only inside callPlane()
// and is never logged, echoed, or included in any thrown error message.

import { createHmac } from 'node:crypto'

const PLANE_BASE_URL = 'https://support.cloboxy.com'

export interface SignPlaneRequestOptions {
  method: 'GET' | 'POST'
  path: string
  rawBody: string
  secret: string
}

export interface SignPlaneRequestResult {
  signature: string
  timestamp: string
}

/** Pure signer — no fetch, no env. Safe to unit test directly. */
export function signPlaneRequest(opts: SignPlaneRequestOptions): SignPlaneRequestResult {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signedPayload = `${timestamp}.${opts.method}.${opts.path}.${opts.rawBody}`
  const signature = createHmac('sha256', opts.secret).update(signedPayload).digest('base64')
  return { signature, timestamp }
}

export interface CallPlaneOptions {
  env: Env
  method: 'GET' | 'POST'
  /** The path AS THE PLANE SEES IT — never the Worker's own inbound path. */
  planePath: string
  /** Exact JSON bytes to send. Omit/empty for GET. */
  rawBody?: string
  /** Forwarded verbatim as the Idempotency-Key header. POST only. */
  idempotencyKey?: string
}

/**
 * Sign and forward a single call to the plane. Never throws — a missing
 * secret returns a typed 500 Response instead of leaking a stack trace or
 * being logged.
 */
export async function callPlane(opts: CallPlaneOptions): Promise<Response> {
  const secret = opts.env.SUPPORT_PLANE_SITE_API_KEY
  if (!secret) {
    return Response.json({ error: 'site key not configured' }, { status: 500 })
  }

  const rawBody = opts.rawBody ?? ''
  const { signature, timestamp } = signPlaneRequest({
    method: opts.method,
    path: opts.planePath,
    rawBody,
    secret,
  })

  const headers: Record<string, string> = {
    'X-Api-Key': secret,
    'X-Signature': signature,
    'X-Timestamp': timestamp,
  }
  if (opts.idempotencyKey) {
    headers['Idempotency-Key'] = opts.idempotencyKey
  }
  if (opts.method === 'POST') {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(`${PLANE_BASE_URL}${opts.planePath}`, {
    method: opts.method,
    headers,
    body: opts.method === 'POST' ? rawBody : undefined,
  })
}
