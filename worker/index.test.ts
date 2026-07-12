import { describe, it, expect, vi } from 'vitest'
import worker from './index'

function makeEnv(): Env {
  return {
    ASSETS: { fetch: vi.fn(async () => new Response('ok')) },
    SUPPORT_PLANE_SITE_API_KEY: 'test-key',
  }
}

describe('worker/index.ts', () => {
  it('falls back to env.ASSETS.fetch for unknown paths', async () => {
    const env = makeEnv()
    const req = new Request('https://datashuttle.ai/about')

    const res = await worker.fetch(req, env)

    expect(env.ASSETS.fetch).toHaveBeenCalledOnce()
    expect(env.ASSETS.fetch).toHaveBeenCalledWith(req)
    expect(await res.text()).toBe('ok')
  })

  it('GET /api/region-catalog returns the 501 placeholder without calling ASSETS', async () => {
    const env = makeEnv()
    const req = new Request('https://datashuttle.ai/api/region-catalog')

    const res = await worker.fetch(req, env)

    expect(res.status).toBe(501)
    expect(await res.json()).toEqual({ error: 'not implemented' })
    expect(env.ASSETS.fetch).not.toHaveBeenCalled()
  })

  it('POST /api/tenant-order returns the 501 placeholder without calling ASSETS', async () => {
    const env = makeEnv()
    const req = new Request('https://datashuttle.ai/api/tenant-order', { method: 'POST' })

    const res = await worker.fetch(req, env)

    expect(res.status).toBe(501)
    expect(await res.json()).toEqual({ error: 'not implemented' })
    expect(env.ASSETS.fetch).not.toHaveBeenCalled()
  })

  it('GET /api/tenant-order (wrong method) falls back to ASSETS, not the placeholder', async () => {
    const env = makeEnv()
    const req = new Request('https://datashuttle.ai/api/tenant-order')

    const res = await worker.fetch(req, env)

    expect(res.status).not.toBe(501)
    expect(env.ASSETS.fetch).toHaveBeenCalledOnce()
  })
})
