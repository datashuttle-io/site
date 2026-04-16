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
        {/* Rendered markdown */}
        <div
          ref={contentRef}
          className="prose prose-invert prose-headings:scroll-mt-24 max-w-none text-slate-300"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => {
                const text = String(children)
                const id = slugify(text)
                return (
                  <h2 id={id} className="text-white">
                    {children}
                  </h2>
                )
              },
              h3: ({ children }) => (
                <h3 className="text-slate-100">{children}</h3>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-indigo-300 hover:text-indigo-200">
                  {children}
                </a>
              ),
              code: ({ children, ...rest }) => (
                <code className="rounded bg-slate-800 px-1 py-0.5" {...rest}>
                  {children}
                </code>
              ),
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
