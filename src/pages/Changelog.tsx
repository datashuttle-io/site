/// /changelog — markdown-rendered repo CHANGELOG.md with scroll-spy TOC (#630).
///
/// The raw import pulls the on-disk `CHANGELOG.md` at build time via
/// Vite's `?raw` loader, so the page always matches what shipped on
/// main — no runtime fetch, no extra CSP exception.

import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// Build-time raw import — Vite resolves this path at bundle time and
// inlines the markdown text. If it ever breaks after a vite upgrade,
// fall back to `public/CHANGELOG.md` + a runtime fetch.
import changelog from '../../../CHANGELOG.md?raw'
import { SEO } from '../components/SEO'

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/\.+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

interface TocEntry {
  id: string
  title: string
}

/// Parse all `## …` headings out of the raw markdown so the TOC sidebar
/// can list them in source order without re-traversing the rendered DOM.
function parseToc(md: string): TocEntry[] {
  const out: TocEntry[] = []
  for (const line of md.split('\n')) {
    const m = line.match(/^##\s+(.+?)\s*$/)
    if (m) {
      const title = m[1].trim()
      out.push({ id: slugify(title), title })
    }
  }
  return out
}

export default function Changelog() {
  const toc = useMemo(() => parseToc(changelog as string), [])
  const [active, setActive] = useState<string | null>(toc[0]?.id ?? null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Scroll-spy: pick the heading nearest the top of the viewport. Uses
  // IntersectionObserver so we're not reading layout on every scroll.
  useEffect(() => {
    if (!contentRef.current) return
    const headings = contentRef.current.querySelectorAll<HTMLHeadingElement>(
      'h2[id]',
    )
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          )
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SEO
        title="Changelog — DataShuttle"
        description="Full release history — every notable change to DataShuttle, in order."
        path="/changelog"
      />
      <header>
        <h1 className="text-4xl font-bold text-white">Changelog</h1>
        <p className="mt-2 text-slate-400">
          Everything that's shipped, in release order. For the curated
          highlights see{' '}
          <a className="text-indigo-400 underline" href="/whats-new">
            /whats-new
          </a>
          .
        </p>
      </header>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_220px]">
        {/* Rendered markdown — Tailwind's @tailwindcss/typography isn't
            installed (kept the website bundle lean), so we hand-style
            every element with per-component classes instead of
            relying on `prose`. */}
        <div
          ref={contentRef}
          className="max-w-none text-slate-300 text-[15px] leading-relaxed"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-white mt-10 mb-4 scroll-mt-24">{children}</h1>
              ),
              h2: ({ children }) => {
                const text = String(children)
                const id = slugify(text)
                return (
                  <h2 id={id} className="text-2xl font-semibold text-white mt-12 mb-4 pb-2 border-b border-slate-800 scroll-mt-24">
                    {children}
                  </h2>
                )
              },
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-slate-100 mt-8 mb-3 scroll-mt-24">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-base font-semibold text-slate-100 mt-6 mb-2">{children}</h4>
              ),
              p: ({ children }) => <p className="my-4">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              a: ({ href, children }) => (
                <a href={href} className="text-indigo-300 underline decoration-indigo-300/40 hover:decoration-indigo-200 hover:text-indigo-200">
                  {children}
                </a>
              ),
              code: ({ children, className, ...rest }) => {
                const isBlock = className?.includes('language-')
                if (isBlock) {
                  return (
                    <code className="block rounded-lg bg-slate-950 border border-slate-800 p-4 my-4 overflow-x-auto text-[13px] font-mono text-slate-200" {...rest}>
                      {children}
                    </code>
                  )
                }
                return (
                  <code className="rounded bg-slate-800 px-1.5 py-0.5 text-[13px] font-mono text-indigo-200" {...rest}>
                    {children}
                  </code>
                )
              },
              pre: ({ children }) => <pre className="my-4 overflow-x-auto">{children}</pre>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-indigo-500/40 pl-4 my-4 text-slate-400 italic">{children}</blockquote>
              ),
              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
              em: ({ children }) => <em className="text-slate-200">{children}</em>,
              hr: () => <hr className="my-8 border-slate-800" />,
              table: ({ children }) => (
                <div className="my-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-slate-900/50">{children}</thead>,
              th: ({ children }) => <th className="px-3 py-2 border border-slate-800 font-medium text-slate-200">{children}</th>,
              td: ({ children }) => <td className="px-3 py-2 border border-slate-800">{children}</td>,
            }}
          >
            {changelog as string}
          </ReactMarkdown>
        </div>

        {/* Sticky TOC (hidden on mobile — collapsed dropdown instead). */}
        <aside className="hidden md:block">
          <nav
            className="sticky top-24 border-l border-slate-800 pl-4"
            aria-label="Table of contents"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Releases
            </p>
            <ul className="mt-3 space-y-1">
              {toc.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className={`block truncate text-xs ${
                      active === entry.id
                        ? 'text-indigo-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {entry.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile-only TOC jump dropdown */}
        <details className="md:hidden mb-4">
          <summary className="cursor-pointer rounded border border-slate-700 px-3 py-2 text-sm text-slate-200">
            Jump to release
          </summary>
          <ul className="mt-2 space-y-1 border-l border-slate-800 pl-4">
            {toc.map((entry) => (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  className="block truncate text-xs text-slate-400 hover:text-slate-200"
                >
                  {entry.title}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </main>
  )
}
