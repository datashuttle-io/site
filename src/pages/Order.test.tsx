/// Component tests for /order (Phase 30, SITE-01/SITE-02).
///
/// Pins: live catalog fetch (never hardcoded), catalog error/empty states,
/// client-side validation (no network request on invalid submit), and the
/// submit -> confirmation round-trip including the Idempotency-Key header.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
// Side-effect import so `tsc -b` (which only includes `src/**`, not the root
// vitest.setup.ts) picks up the jest-dom matcher type augmentations for this
// file's `toBeInTheDocument()` assertions.
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import Order from './Order'

function renderOrder() {
  return render(
    <MemoryRouter>
      <Order />
    </MemoryRouter>,
  )
}

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = ok ? 200 : 500 } = init
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('Order page', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders a radio-card for each live-fetched region option (SITE-01: live, not hardcoded)', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ regions: [{ cloudProvider: 'aws', region: 'eu-west-1' }] }),
    )
    renderOrder()

    expect(await screen.findByLabelText(/AWS/i)).toBeInTheDocument()
    expect(screen.getByText('eu-west-1')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/region-catalog')
  })

  it('shows "Couldn\'t load regions" + a working retry on catalog fetch failure, with zero region options', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { ok: false, status: 500 }))
    renderOrder()

    expect(await screen.findByText("Couldn't load regions")).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ regions: [{ cloudProvider: 'aws', region: 'eu-west-1' }] }),
    )
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByLabelText(/AWS/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('renders the empty-catalog dead-end copy with no retry button when regions is []', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ regions: [] }))
    renderOrder()

    expect(await screen.findByText('No regions available right now')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('shows the region-required error and fires no POST when submitting without a region', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ regions: [{ cloudProvider: 'aws', region: 'eu-west-1' }] }),
    )
    renderOrder()
    await screen.findByLabelText(/AWS/i)

    fireEvent.change(screen.getByLabelText('Work email'), {
      target: { value: 'valid@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /request tenant/i }))

    expect(
      await screen.findByText('Choose a cloud and region to continue.'),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1) // only the initial catalog GET
  })

  it('shows an email-format error and fires no POST when the email is invalid', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ regions: [{ cloudProvider: 'aws', region: 'eu-west-1' }] }),
    )
    renderOrder()
    fireEvent.click(await screen.findByLabelText(/AWS/i))

    fireEvent.change(screen.getByLabelText('Work email'), {
      target: { value: 'not-an-email' },
    })
    fireEvent.click(screen.getByRole('button', { name: /request tenant/i }))

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('submits with an Idempotency-Key + JSON content-type and shows the confirmation with the returned tenantRequestId (SITE-02)', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ regions: [{ cloudProvider: 'aws', region: 'eu-west-1' }] }),
    )
    renderOrder()
    fireEvent.click(await screen.findByLabelText(/AWS/i))
    fireEvent.change(screen.getByLabelText('Work email'), {
      target: { value: 'buyer@example.com' },
    })

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ tenantRequestId: 'abc-123', status: 'awaiting_approval' }),
    )
    fireEvent.click(screen.getByRole('button', { name: /request tenant/i }))

    expect(await screen.findByText('Request received')).toBeInTheDocument()
    expect(screen.getByText('abc-123')).toBeInTheDocument()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const postCall = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(postCall[0]).toBe('/api/tenant-order')
    expect(postCall[1].method).toBe('POST')
    const headers = postCall[1].headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers['Idempotency-Key']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  })

  it('sends a plane-safe body — cloud_provider/region/contact_email present, no client-controlled product field', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ regions: [{ cloudProvider: 'aws', region: 'eu-west-1' }] }),
    )
    renderOrder()
    fireEvent.click(await screen.findByLabelText(/AWS/i))
    fireEvent.change(screen.getByLabelText('Work email'), {
      target: { value: 'buyer@example.com' },
    })

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ tenantRequestId: 'abc-123', status: 'awaiting_approval' }),
    )
    fireEvent.click(screen.getByRole('button', { name: /request tenant/i }))
    await screen.findByText('Request received')

    const postCall = fetchMock.mock.calls[1] as [string, RequestInit]
    const body = JSON.parse(postCall[1].body as string) as Record<string, unknown>
    expect(body).toMatchObject({
      cloud_provider: 'aws',
      region: 'eu-west-1',
      contact_email: 'buyer@example.com',
    })
    expect(body).not.toHaveProperty('product')
  })
})
