import { describe, it, expect, vi, afterEach } from 'vitest'
import worker from './index'
import * as planeClient from './plane-client'

function makeEnv(): Env {
  return {
    ASSETS: { fetch: vi.fn(async () => new Response('ok')) },
    SUPPORT_PLANE_SITE_API_KEY: 'test-key',
  }
}

describe('worker/index.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to env.ASSETS.fetch for unknown paths', async () => {
    const env = makeEnv()
    const req = new Request('https://datashuttle.ai/about')

    const res = await worker.fetch(req, env)

    expect(env.ASSETS.fetch).toHaveBeenCalledOnce()
    expect(env.ASSETS.fetch).toHaveBeenCalledWith(req)
    expect(await res.text()).toBe('ok')
  })

  it('GET /api/tenant-order (wrong method) falls back to ASSETS, not a handler', async () => {
    const env = makeEnv()
    const req = new Request('https://datashuttle.ai/api/tenant-order')

    const res = await worker.fetch(req, env)

    expect(res.status).not.toBe(501)
    expect(env.ASSETS.fetch).toHaveBeenCalledOnce()
  })

  describe('GET /api/region-catalog', () => {
    it('calls callPlane for the plane-side path and relays { regions } with a short Cache-Control', async () => {
      const env = makeEnv()
      vi.spyOn(planeClient, 'callPlane').mockResolvedValue(
        Response.json({ regions: [{ cloudProvider: 'aws', region: 'eu-west-1' }] }, { status: 200 }),
      )

      const req = new Request('https://datashuttle.ai/api/region-catalog')
      const res = await worker.fetch(req, env)

      expect(planeClient.callPlane).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', planePath: '/api/region-catalog' }),
      )
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ regions: [{ cloudProvider: 'aws', region: 'eu-west-1' }] })
      expect(res.headers.get('Cache-Control')).toMatch(/max-age=60/)
    })

    it('translates a plane 500 with a raw error body to a generic message — no leak', async () => {
      const env = makeEnv()
      vi.spyOn(planeClient, 'callPlane').mockResolvedValue(
        Response.json({ error: 'internal db failure at row 42', stack: 'leaked-stack' }, { status: 500 }),
      )

      const req = new Request('https://datashuttle.ai/api/region-catalog')
      const res = await worker.fetch(req, env)

      expect(res.status).toBe(502)
      const body = (await res.json()) as Record<string, unknown>
      const serialized = JSON.stringify(body)
      expect(serialized).not.toContain('internal db failure')
      expect(serialized).not.toContain('leaked-stack')
      expect(typeof body.error).toBe('string')
    })

    it('translates a plane 429 to a generic 429 (no raw body leak)', async () => {
      const env = makeEnv()
      vi.spyOn(planeClient, 'callPlane').mockResolvedValue(
        Response.json({ error: 'rate_limited', retryAfterMs: 5000 }, { status: 429 }),
      )

      const req = new Request('https://datashuttle.ai/api/region-catalog')
      const res = await worker.fetch(req, env)

      expect(res.status).toBe(429)
      const body = (await res.json()) as Record<string, unknown>
      expect(JSON.stringify(body)).not.toContain('rate_limited')
    })
  })

  describe('POST /api/tenant-order', () => {
    function orderRequest(body: Record<string, unknown>, headers: Record<string, string> = {}) {
      return new Request('https://datashuttle.ai/api/tenant-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      })
    }

    it('forwards the client Idempotency-Key verbatim to callPlane against the plane path, and relays the result', async () => {
      const env = makeEnv()
      vi.spyOn(planeClient, 'callPlane').mockResolvedValue(
        Response.json({ tenantRequestId: 'tr_1', status: 'awaiting_approval' }, { status: 202 }),
      )

      const req = orderRequest(
        { cloud_provider: 'aws', region: 'eu-west-1', contact_email: 'a@b.com' },
        { 'Idempotency-Key': 'client-uuid-1' },
      )
      const res = await worker.fetch(req, env)

      expect(planeClient.callPlane).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          planePath: '/api/tenant-requests',
          idempotencyKey: 'client-uuid-1',
        }),
      )
      expect(res.status).toBe(202)
      expect(await res.json()).toEqual({ tenantRequestId: 'tr_1', status: 'awaiting_approval' })
    })

    it('never forwards a client-supplied product field — always the literal datashuttle', async () => {
      const env = makeEnv()
      const spy = vi
        .spyOn(planeClient, 'callPlane')
        .mockResolvedValue(Response.json({ tenantRequestId: 'tr_1', status: 'awaiting_approval' }, { status: 202 }))

      const req = orderRequest(
        { product: 'neksur', cloud_provider: 'aws', region: 'eu-west-1', contact_email: 'a@b.com' },
        { 'Idempotency-Key': 'client-uuid-2' },
      )
      await worker.fetch(req, env)

      const call = spy.mock.calls[0]![0] as { rawBody?: string }
      const forwarded = JSON.parse(call.rawBody ?? '{}') as Record<string, unknown>
      expect(forwarded.product).toBe('datashuttle')
    })

    it('a retry with the SAME Idempotency-Key still forwards that same key (no fresh UUID minted)', async () => {
      const env = makeEnv()
      const spy = vi
        .spyOn(planeClient, 'callPlane')
        .mockResolvedValue(Response.json({ tenantRequestId: 'tr_1', status: 'awaiting_approval' }, { status: 202 }))

      const body = { cloud_provider: 'aws', region: 'eu-west-1', contact_email: 'a@b.com' }
      const req1 = orderRequest(body, { 'Idempotency-Key': 'same-key' })
      const req2 = orderRequest(body, { 'Idempotency-Key': 'same-key' })

      await worker.fetch(req1, env)
      await worker.fetch(req2, env)

      expect(spy.mock.calls[0]![0]).toMatchObject({ idempotencyKey: 'same-key' })
      expect(spy.mock.calls[1]![0]).toMatchObject({ idempotencyKey: 'same-key' })
    })

    it('mints an Idempotency-Key when the client omits the header', async () => {
      const env = makeEnv()
      const spy = vi
        .spyOn(planeClient, 'callPlane')
        .mockResolvedValue(Response.json({ tenantRequestId: 'tr_1', status: 'awaiting_approval' }, { status: 202 }))

      const req = orderRequest({ cloud_provider: 'aws', region: 'eu-west-1', contact_email: 'a@b.com' })
      await worker.fetch(req, env)

      const call = spy.mock.calls[0]![0] as { idempotencyKey?: string }
      expect(call.idempotencyKey).toBeTruthy()
      expect(typeof call.idempotencyKey).toBe('string')
    })

    it('translates a plane error to a generic customer-facing message — no raw detail leak', async () => {
      const env = makeEnv()
      vi.spyOn(planeClient, 'callPlane').mockResolvedValue(
        Response.json({ error: 'bad_signature', reason: 'internal-only-detail' }, { status: 400 }),
      )

      const req = orderRequest(
        { cloud_provider: 'aws', region: 'eu-west-1', contact_email: 'a@b.com' },
        { 'Idempotency-Key': 'k' },
      )
      const res = await worker.fetch(req, env)

      expect(res.status).toBe(502)
      const body = (await res.json()) as Record<string, unknown>
      const serialized = JSON.stringify(body)
      expect(serialized).not.toContain('bad_signature')
      expect(serialized).not.toContain('internal-only-detail')
    })
  })
})
