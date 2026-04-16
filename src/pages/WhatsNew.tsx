/// /whats-new — curated headline-feature showcase (#629).
///
/// Not chronological. For the full release history see /changelog.
/// Card data lives in website/src/data/whats-new.ts — edit there
/// when a release ships a flagship capability.

import { CARDS } from '../data/whats-new'
import { SEO } from '../components/SEO'

function ShowcaseCard({
  card,
  orientation,
}: {
  card: (typeof CARDS)[number]
  orientation: 'left' | 'right'
}) {
  const textFirst = orientation === 'left'
  return (
    <div
      className={`grid gap-8 md:grid-cols-2 md:items-center ${
        textFirst ? '' : 'md:[&>div:first-child]:order-2'
      }`}
    >
      {/* Text side */}
      <div>
        <span className="inline-block rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
          {card.badge}
        </span>
        <h3 className="mt-3 text-2xl font-semibold text-white">{card.title}</h3>
        <p className="mt-3 text-slate-300 leading-relaxed">
          {card.description}
        </p>
        {card.changelogAnchor && (
          <a
            href={`/changelog${card.changelogAnchor}`}
            className="mt-4 inline-block text-sm text-indigo-300 hover:text-indigo-200"
          >
            See release notes →
          </a>
        )}
      </div>

      {/* Snippet side — rendered as a code block; when there's no
          snippet fall back to a quiet decorative placeholder so the
          grid keeps its rhythm. */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        {card.snippet ? (
          <pre className="overflow-x-auto text-xs leading-relaxed text-slate-100">
            <code>{card.snippet}</code>
          </pre>
        ) : (
          <div className="flex h-full min-h-[120px] items-center justify-center text-center">
            <div>
              <div className="text-4xl">✨</div>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                {card.badge}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WhatsNew() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SEO
        title="What's new in DataShuttle"
        description="Highlights from recent releases — Iceberg V3, lineage, resource pools."
        path="/whats-new"
        ogImage="og-whatsnew.jpg"
      />
      <header className="text-center">
        <h1 className="text-4xl font-bold text-white md:text-5xl">
          What's new in DataShuttle
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-lg text-slate-400">
          Curated highlights of the capabilities we've shipped recently.
          Looking for the full release log? Hit {' '}
          <a href="/changelog" className="text-indigo-400 underline">
            /changelog
          </a>
          .
        </p>
      </header>

      <section className="mt-16 space-y-20">
        {CARDS.map((c, i) => (
          <ShowcaseCard
            key={c.title}
            card={c}
            orientation={i % 2 === 0 ? 'left' : 'right'}
          />
        ))}
      </section>

      <section className="mt-20 rounded-2xl border border-slate-800 bg-gradient-to-br from-indigo-900/30 to-slate-950/30 p-8 text-center">
        <h2 className="text-2xl font-semibold text-white">
          Ready to take it for a spin?
        </h2>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/cloud"
            className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Try it on Cloud →
          </a>
          <a
            href="https://hub.docker.com/r/datashuttle/datashuttle"
            className="rounded-full border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            Self-host with Docker
          </a>
          <a
            href="/changelog"
            className="text-sm text-indigo-300 hover:text-indigo-200"
          >
            See the full changelog →
          </a>
        </div>
      </section>
    </main>
  )
}
