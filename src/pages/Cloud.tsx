import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

export default function Cloud() {
  return (
    <>
      <SEO title="DataShuttle Cloud — Public Beta" description="Managed Iceberg ingestion on datashuttle.ai. Same binary as self-host — run by us." path="/cloud" ogImage="og-cloud.jpg" />
      <div className="ds-wrap">
        <section className="ds-hero">
          <div>
            <div className="eyebrow"><span className="pill">Public beta · sign up free</span></div>
            <h1>DataShuttle Cloud. Managed Iceberg ingestion.</h1>
            <p className="lede">
              Fully managed control plane on <code>app.datashuttle.ai</code>. Iceberg
              ingestion, CDC streaming, and SQL transforms without provisioning a cluster.
              Same engine you'd self-host — run, patched, and backed up by us.
            </p>
            <div className="actions">
              <a className="ds-btn ds-btn-primary" href="https://app.datashuttle.ai/signup">Start free</a>
              <Link className="ds-btn ds-btn-secondary" to="/pricing">See pricing</Link>
            </div>
          </div>
        </section>

        <section className="ds-sec">
          <div className="ds-sec-head">
            <div className="eyebrow">01 · what you get</div>
            <h2>Managed. Multi-tenant. Compliant.</h2>
          </div>
          <div className="ds-features">
            {[
              ['Managed control plane', 'Postgres, Redis, Caddy-TLS, and the DataShuttle API on dedicated infrastructure. You hit an endpoint — we keep it up.'],
              ['Multi-tenant + RBAC', 'Per-tenant S3 warehouse prefix, JWT-scoped access, tenant-isolated DPU quotas. Pen-tested before GA.'],
              ['GDPR compliant', 'Export-my-data endpoint, 90-day soft-delete grace, signed audit chain, DPA on request. Built for EU customers from day one.'],
            ].map(([h, p]) => (
              <div className="ds-feat" key={h}>
                <h4>{h}</h4><p>{p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ds-sec" id="self-host">
          <div className="ds-sec-head">
            <div className="eyebrow">02 · prefer to run it yourself?</div>
            <h2>Self-host stays free.</h2>
            <p>Same binary, same Iceberg output. Self-host on your own infrastructure at no cost.</p>
          </div>
          <div className="actions" style={{ display: 'flex', gap: 10 }}>
            <Link className="ds-btn ds-btn-secondary" to="/download">Self-host install guide</Link>
          </div>
        </section>
      </div>
    </>
  )
}
