/// Per-route head manager (#632).
///
/// Hand-rolled instead of react-helmet-async — react-helmet-async 2.x
/// has a typing regression against React 19 (ProviderProps doesn't
/// satisfy the new JSX component contract) that would force us to
/// either pin React 18 or patch the helmet types. A ~30-line useEffect
/// does the exact same job and ships zero extra bundle weight.
///
/// Each page renders one `<SEO />`. The hook sets document.title and
/// upserts canonical + description + OG tags on mount, leaving the
/// values in place on unmount (the next route's `<SEO />` overwrites
/// them — no flash-of-empty-title during transitions).

import { useEffect } from 'react'

const SITE = 'https://datashuttle.ai'

export interface SEOProps {
  title: string
  description: string
  /// Relative path — must start with `/`. Canonical = SITE + path.
  path: string
  /// Filename under /og/ in public. Defaults to the shared home card.
  ogImage?: string
}

/// Upsert a `<meta>` tag by name or property. Returns the element so
/// the caller can keep a reference for cleanup, though we intentionally
/// don't clean up on unmount — the next page's SEO component immediately
/// overwrites, and route transitions briefly running with a stale title
/// looks worse than letting it stick.
function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function SEO({ title, description, path, ogImage = 'og-home.jpg' }: SEOProps) {
  useEffect(() => {
    const canonical = `${SITE}${path}`
    const ogUrl = `${SITE}/og/${ogImage}`

    document.title = title
    upsertMeta('meta[name="description"]', 'name', 'description', description)
    upsertLink('canonical', canonical)

    // Open Graph — Facebook, LinkedIn, Slack unfurls
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'DataShuttle')
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical)
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', ogUrl)

    // Twitter
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogUrl)
  }, [title, description, path, ogImage])

  return null
}
