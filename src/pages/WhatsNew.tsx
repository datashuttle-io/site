/// /whats-new — curated headline-feature showcase (#629).
///
/// Not chronological. Card data lives in website/src/data/whats-new.ts —
/// edit there when a release ships a flagship capability.

import { Link } from 'react-router-dom'
import { CARDS } from '../data/whats-new'
import { SEO } from '../components/SEO'

function ShowcaseCard({ card }: { card: (typeof CARDS)[number] }) {
  if (!card.snippet) {
    return (
      <article className="ds-shot solo">
        <div>
          <span className="badge">{card.badge}</span>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </div>
      </article>
    )
  }
  return (
    <article className="ds-shot">
      <div>
        <span className="badge">{card.badge}</span>
        <h3>{card.title}</h3>
        <p>{card.description}</p>
      </div>
      <div className="code">
        <pre>
          <code>{card.snippet}</code>
        </pre>
      </div>
    </article>
  )
}

export default function WhatsNew() {
  return (
    <>
      <SEO
        title="What's new in DataShuttle"
        description="Highlights from recent releases — Iceberg V3, lineage, resource pools."
        path="/whats-new"
        ogImage="og-whatsnew.jpg"
      />
      <div className="ds-wrap">
        <section className="ds-hero" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <div className="eyebrow">
              <span className="pill">What's new</span>
            </div>
            <h1>Recent headline capabilities.</h1>
            <p className="lede">
              Curated highlights of what we've shipped. Not a changelog —
              for the full release history see the{' '}
              <a
                href="https://github.com/datashuttle-ai/datashuttle/releases"
                style={{ color: 'var(--accent-400)' }}
              >
                GitHub releases
              </a>
              .
            </p>
          </div>
        </section>

        <section className="ds-sec">
          <div className="ds-showcase">
            {CARDS.map((c) => (
              <ShowcaseCard key={c.title} card={c} />
            ))}
          </div>
        </section>

        <section className="ds-sec">
          <div className="ds-sec-head" style={{ textAlign: 'center', margin: '0 auto' }}>
            <h2>Ready to take it for a spin?</h2>
          </div>
          <div
            className="actions"
            style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link className="ds-btn ds-btn-primary" to="/cloud">
              Try it on Cloud
            </Link>
            <Link className="ds-btn ds-btn-secondary" to="/download">
              Self-host free
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
