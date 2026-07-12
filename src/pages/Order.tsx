/// /order — customer-facing tenant order page (Phase 30, SITE-01/SITE-02).
///
/// State machine: catalog-loading -> catalog-error / empty-catalog / form
/// -> submitting -> submit-error / success. Regions are fetched live from
/// the same-origin Worker proxy (`GET /api/region-catalog`) on mount —
/// there is deliberately NO hardcoded fallback list; a fetch failure or an
/// empty catalog both render a dead-end state instead of guessing.
///
/// Submitting POSTs to `/api/tenant-order` with a fresh `crypto.randomUUID()`
/// Idempotency-Key generated once per logical submission and reused verbatim
/// on any client retry of that same submission (never regenerated on retry).

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { Icon } from '../components/Icon'

interface RegionOption {
  cloudProvider: string
  region: string
}

type CatalogState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'empty' }
  | { status: 'loaded'; regions: RegionOption[] }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(value: string): string | null {
  if (!value) return 'Enter your work email.'
  if (value.length > 320) return 'Email must be 320 characters or fewer.'
  if (!EMAIL_RE.test(value)) return 'Enter a valid email address.'
  return null
}

function validateCompany(value: string): string | null {
  if (value.length > 256) return 'Company must be 256 characters or fewer.'
  return null
}

function regionKey(r: RegionOption): string {
  return `${r.cloudProvider}:${r.region}`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // clipboard API blocked — ignore
        }
      }}
      className="ds-copy"
      aria-label="Copy order reference"
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  )
}

export default function Order() {
  const [catalog, setCatalog] = useState<CatalogState>({ status: 'loading' })
  const [selectedRegion, setSelectedRegion] = useState<RegionOption | null>(null)
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [companyTouched, setCompanyTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [result, setResult] = useState<{ tenantRequestId: string } | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const idempotencyKeyRef = useRef<string | null>(null)
  const regionGroupRef = useRef<HTMLFieldSetElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const companyInputRef = useRef<HTMLInputElement>(null)
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null)

  const fetchCatalog = useCallback(() => {
    setCatalog({ status: 'loading' })
    fetch('/api/region-catalog')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad status'))))
      .then((d: { regions?: RegionOption[] }) => {
        const regions = Array.isArray(d?.regions) ? d.regions : []
        if (regions.length === 0) {
          setCatalog({ status: 'empty' })
        } else {
          setCatalog({ status: 'loaded', regions })
        }
      })
      .catch(() => setCatalog({ status: 'error' }))
  }, [])

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  useEffect(() => {
    if (result) {
      confirmHeadingRef.current?.focus()
    }
  }, [result])

  const emailError = emailTouched || submitAttempted ? validateEmail(email) : null
  const companyError = companyTouched || submitAttempted ? validateCompany(company) : null
  const regionError = submitAttempted && !selectedRegion ? 'Choose a cloud and region to continue.' : null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)
    setEmailTouched(true)
    setCompanyTouched(true)

    const eErr = validateEmail(email)
    const cErr = validateCompany(company)
    const rErr = !selectedRegion

    if (rErr) {
      regionGroupRef.current?.focus()
      return
    }
    if (eErr) {
      emailInputRef.current?.focus()
      return
    }
    if (cErr) {
      companyInputRef.current?.focus()
      return
    }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID()
    }

    setSubmitting(true)
    setSubmitError(false)

    try {
      const res = await fetch('/api/tenant-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKeyRef.current,
        },
        body: JSON.stringify({
          cloud_provider: selectedRegion!.cloudProvider,
          region: selectedRegion!.region,
          contact_email: email,
          ...(company ? { company } : {}),
        }),
      })
      if (!res.ok) throw new Error('bad status')
      const data: { tenantRequestId?: string } = await res.json()
      if (!data?.tenantRequestId) throw new Error('bad body')
      setSubmittedEmail(email)
      setResult({ tenantRequestId: data.tenantRequestId })
      setSubmitting(false)
    } catch {
      setSubmitting(false)
      setSubmitError(true)
    }
  }

  return (
    <>
      <SEO
        title="Order a tenant — DataShuttle"
        description="Pick a cloud and region, tell us who to reach, and we'll set up your DataShuttle Cloud tenant."
        path="/order"
      />
      <div className="ds-wrap">
        <section className="ds-hero solo">
          <div>
            <div className="eyebrow">
              <span className="pill">Order</span>
            </div>
            <h1>Get a DataShuttle Cloud tenant.</h1>
            <p className="lede">
              Pick a cloud and region, tell us who to reach, and we'll set up
              your tenant. A person reviews every request — usually within one
              business day.
            </p>
          </div>
        </section>

        <section className="ds-sec flush order-sec">
          <div className="order-card">
            {result ? (
              <div className="order-confirm">
                <div className="ico-badge">
                  <Icon name="check-circle" size={32} />
                </div>
                <h3 className="h3" tabIndex={-1} ref={confirmHeadingRef}>
                  Request received
                </h3>
                <p className="body">Your order reference:</p>
                <div className="ref-id">
                  <code>{result.tenantRequestId}</code>
                  <CopyButton text={result.tenantRequestId} />
                </div>
                <p className="body">
                  A person on our team reviews every request by hand — no
                  tenant is created automatically. Once approved, we'll set
                  everything up and email you at <strong>{submittedEmail}</strong>{' '}
                  with your access details. This usually takes one business
                  day.
                </p>
                <div className="actions">
                  <Link className="ds-btn ds-btn-ghost" to="/">
                    Back to datashuttle.ai
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div aria-live="polite">
                  {catalog.status === 'loading' && (
                    <div className="order-block">
                      <h3 className="h3">Choose cloud &amp; region</h3>
                      <p className="hint">
                        Available regions are pulled live from our infrastructure.
                      </p>
                      <div className="ds-radio-grid">
                        <div className="skeleton" style={{ height: 76 }} />
                        <div className="skeleton" style={{ height: 76 }} />
                        <div className="skeleton" style={{ height: 76 }} />
                      </div>
                      <p className="hint" style={{ textAlign: 'center', marginTop: 12 }}>
                        Loading available regions…
                      </p>
                    </div>
                  )}

                  {catalog.status === 'error' && (
                    <div className="order-block">
                      <h3 className="h3">Choose cloud &amp; region</h3>
                      <div className="order-error-banner" role="alert">
                        <span className="ico" aria-hidden="true">
                          <Icon name="alert-triangle" size={18} />
                        </span>
                        <div>
                          <h4>Couldn't load regions</h4>
                          <p>
                            We couldn't reach our region catalog. This is
                            usually temporary.
                          </p>
                          <button
                            type="button"
                            className="ds-btn ds-btn-secondary"
                            onClick={fetchCatalog}
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {catalog.status === 'empty' && (
                    <div className="order-block">
                      <h3 className="h3">Choose cloud &amp; region</h3>
                      <div className="order-error-banner" role="alert">
                        <span className="ico" aria-hidden="true">
                          <Icon name="alert-triangle" size={18} />
                        </span>
                        <div>
                          <h4>No regions available right now</h4>
                          <p>
                            We don't have any regions open for new tenants
                            at the moment. Check back soon, or email{' '}
                            <a href="mailto:sales@datashuttle.ai">
                              sales@datashuttle.ai
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {catalog.status === 'loaded' && (
                    <div className="order-block">
                      <h3 className="h3">Choose cloud &amp; region</h3>
                      <p className="hint">
                        Available regions are pulled live from our infrastructure.
                      </p>
                      {regionError && (
                        <p className="error" role="alert" style={{ marginBottom: 8 }}>
                          {regionError}
                        </p>
                      )}
                      <fieldset
                        ref={regionGroupRef}
                        tabIndex={-1}
                        style={{ border: 0, padding: 0, margin: 0 }}
                      >
                        <legend className="sr-only">Cloud and region</legend>
                        <div className={`ds-radio-grid${regionError ? ' invalid' : ''}`}>
                          {catalog.regions.map((r) => {
                            const key = regionKey(r)
                            const selected = selectedRegion !== null && regionKey(selectedRegion) === key
                            return (
                              <div className="ds-radio-card" key={key}>
                                <input
                                  type="radio"
                                  className="sr-only"
                                  id={`region-${key}`}
                                  name="region"
                                  value={key}
                                  checked={selected}
                                  onChange={() => setSelectedRegion(r)}
                                />
                                <label htmlFor={`region-${key}`} className="card-face">
                                  <span className="top-row">
                                    <Icon name="cloud" size={18} />
                                    <span className="cloud-name">
                                      {r.cloudProvider.toUpperCase()}
                                    </span>
                                  </span>
                                  <span className="region-code">{r.region}</span>
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      </fieldset>
                      <p className="hint" style={{ marginTop: 12 }}>
                        You'll start on the Community tier — upgrade any
                        time after your tenant is live.
                      </p>
                    </div>
                  )}
                </div>

                {catalog.status === 'loaded' && (
                  <div className="order-block">
                    <h3 className="h3">Your details</h3>
                    <div className="order-fields">
                      <div className={`ds-field${emailError ? ' invalid' : ''}`}>
                        <label htmlFor="order-email">Work email</label>
                        <input
                          ref={emailInputRef}
                          id="order-email"
                          className="ds-input"
                          type="email"
                          placeholder="you@company.com"
                          maxLength={320}
                          value={email}
                          disabled={submitting}
                          aria-invalid={emailError ? true : undefined}
                          aria-describedby={emailError ? 'order-email-error' : 'order-email-hint'}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setEmailTouched(true)}
                        />
                        {emailError ? (
                          <p className="error" id="order-email-error" aria-live="polite">
                            {emailError}
                          </p>
                        ) : (
                          <p className="hint" id="order-email-hint">
                            We'll send access details here once approved.
                          </p>
                        )}
                      </div>

                      <div className={`ds-field${companyError ? ' invalid' : ''}`}>
                        <label htmlFor="order-company">
                          Company <span className="opt">(optional)</span>
                        </label>
                        <input
                          ref={companyInputRef}
                          id="order-company"
                          className="ds-input"
                          type="text"
                          placeholder="Acme Inc."
                          maxLength={256}
                          value={company}
                          disabled={submitting}
                          aria-invalid={companyError ? true : undefined}
                          aria-describedby={companyError ? 'order-company-error' : undefined}
                          onChange={(e) => setCompany(e.target.value)}
                          onBlur={() => setCompanyTouched(true)}
                        />
                        {companyError && (
                          <p className="error" id="order-company-error" aria-live="polite">
                            {companyError}
                          </p>
                        )}
                      </div>
                    </div>

                    {submitError && (
                      <div className="order-error-banner" role="alert" style={{ marginTop: 'var(--s-4)' }}>
                        <span className="ico" aria-hidden="true">
                          <Icon name="alert-triangle" size={18} />
                        </span>
                        <div>
                          <h4>Something went wrong</h4>
                          <p>
                            We couldn't submit your request. Please try
                            again — if it keeps failing, email us at{' '}
                            <a href="mailto:sales@datashuttle.ai">
                              sales@datashuttle.ai
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 'var(--s-4)' }}>
                      <button
                        type="submit"
                        className="ds-btn ds-btn-primary ds-btn-lg"
                        disabled={submitting}
                        aria-busy={submitting}
                      >
                        {submitting ? (
                          <>
                            <Icon name="loader" size={15} className="anim-spin" /> Requesting…
                          </>
                        ) : submitError ? (
                          'Try again'
                        ) : (
                          <>
                            Request tenant <Icon name="arrow-right" size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
