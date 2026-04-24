/// /changelog — curated headline-feature showcase.
///
/// Not chronological. Card data lives in website/src/data/whats-new.ts —
/// edit there when a release ships a flagship capability.

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

export default function Changelog() {
  return (
    <>
      <SEO
        title="Changelog — DataShuttle"
        description="Release highlights — the flagship capabilities we shipped. For the full version history, see GitHub Releases."
        path="/changelog"
        ogImage="og-whatsnew.jpg"
      />
      <div className="ds-wrap">
        <section className="ds-hero" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <div className="eyebrow">
              <span className="pill">Changelog</span>
            </div>
            <h1>Release highlights.</h1>
            <p className="lede">
              Curated highlights of what we've shipped recently. This page is
              not the full version log — for the complete history, see{' '}
              <a
                href="https://github.com/datashuttle-ai/datashuttle/releases"
                style={{ color: 'var(--accent-400)' }}
              >
                GitHub Releases
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
      </div>
    </>
  )
}
