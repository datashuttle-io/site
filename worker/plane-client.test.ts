import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createHmac } from 'node:crypto'
import { signPlaneRequest, callPlane } from './plane-client'

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    ASSETS: { fetch: vi.fn(async () => new Response('ok')) },
    SUPPORT_PLANE_SITE_API_KEY: 'test-secret',
    ...overrides,
  }
}

describe('signPlaneRequest', () => {
  it('GET signature matches an independently recomputed HMAC-SHA256 over timestamp.GET.path.', () => {
    const { signature, timestamp } = signPlaneRequest({
      method: 'GET',
      path: '/api/region-catalog',
      rawBody: '',
      secret: 'k',
    })

    const expected = createHmac('sha256', 'k')
      .update(`${timestamp}.GET./api/region-catalog.`)
      .digest('base64')

    expect(signature).toBe(expected)
  })

  it('POST signature is computed over the PLANE path (/api/tenant-requests), not the worker inbound path', () => {
    const rawBody = JSON.stringify({ product: 'datashuttle', cloud_provider: 'aws', region: 'eu-west-1' })

    const { signature, timestamp } = signPlaneRequest({
      method: 'POST',
      path: '/api/tenant-requests',
      rawBody,
      secret: 'k',
    })

    const expected = createHmac('sha256', 'k')
      .update(`${timestamp}.POST./api/tenant-requests.${rawBody}`)
      .digest('base64')

    expect(signature).toBe(expected)
  })

  it('signs at call-time — timestamps a second apart differ (never memoized)', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(1_700_000_000_000))
      const first = signPlaneRequest({
        method: 'GET',
        path: '/api/region-catalog',
        rawBody: '',
        secret: 'k',
      })

      vi.setSystemTime(new Date(1_700_000_001_000))
      const second = signPlaneRequest({
        method: 'GET',
        path: '/api/region-catalog',
        rawBody: '',
        secret: 'k',
      })

      expect(second.timestamp).not.toBe(first.timestamp)
      expect(second.signature).not.toBe(first.signature)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('callPlane', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 200 })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GET sets X-Api-Key, X-Signature, X-Timestamp headers and never Idempotency-Key', async () => {
    const env = makeEnv()

    await callPlane({ env, method: 'GET', planePath: '/api/region-catalog' })

    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>
    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://support.cloboxy.com/api/region-catalog')
    const headers = init.headers as Record<string, string>
    expect(headers['X-Api-Key']).toBe('test-secret')
    expect(headers['X-Signature']).toBeTruthy()
    expect(headers['X-Timestamp']).toBeTruthy()
    expect(headers['Idempotency-Key']).toBeUndefined()
  })

  it('POST forwards the given Idempotency-Key verbatim', async () => {
    const env = makeEnv()

    await callPlane({
      env,
      method: 'POST',
      planePath: '/api/tenant-requests',
      rawBody: '{"product":"datashuttle"}',
      idempotencyKey: 'uuid-fixed-1',
    })

    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://support.cloboxy.com/api/tenant-requests')
    const headers = init.headers as Record<string, string>
    expect(headers['Idempotency-Key']).toBe('uuid-fixed-1')
    expect(init.body).toBe('{"product":"datashuttle"}')
  })

  it('POST without an idempotencyKey omits the Idempotency-Key header', async () => {
    const env = makeEnv()

    await callPlane({
      env,
      method: 'POST',
      planePath: '/api/tenant-requests',
      rawBody: '{}',
    })

    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers['Idempotency-Key']).toBeUndefined()
  })

  it('returns a 500 typed failure (never throws, never logs) when the secret is unset', async () => {
    const env = makeEnv({ SUPPORT_PLANE_SITE_API_KEY: '' })

    const res = await callPlane({ env, method: 'GET', planePath: '/api/region-catalog' })

    expect(res.status).toBe(500)
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
