/// /whats-new — curated headline-feature showcase (#629).
///
/// Not chronological. For the full release history see /changelog.
/// Card data lives in website/src/data/whats-new.ts — edit there
/// when a release ships a flagship capability.

import { CARDS } from '../data/whats-new'
import { SEO } from '../components/SEO'

function ShowcaseCard({
  card,
}: {
  card: (typeof CARDS)[number]
}) {
  // Cards without a code snippet render as a single-column text-only
  // block — the previous placeholder ("✨" in a bordered box) read
  // as an "empty" card to visitors. Cards with snippets keep the
  // side-by-side grid.
  if (!card.snippet) {
    return (
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
          {card.badge}
        </span>
        <h3 className="mt-3 text-2xl font-semibold text-white">{card.title}</h3>
        <p className="mt-3 text-slate-300 leading-relaxed">{card.description}</p>
      </div>
    )
  }
  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center">
      <div>
        <span className="inline-block rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
          {card.badge}
        </span>
        <h3 className="mt-3 text-2xl font-semibold text-white">{card.title}</h3>
        <p className="mt-3 text-slate-300 leading-relaxed">{card.description}</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <pre className="overflow-x-auto text-xs leading-relaxed text-slate-100">
          <code>{card.snippet}</code>
        </pre>
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
        </p>
      </header>

      <section className="mt-16 space-y-20">
        {CARDS.map((c) => (
          <ShowcaseCard key={c.title} card={c} />
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
        </div>
      </section>
    </main>
  )
}
