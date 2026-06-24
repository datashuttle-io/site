/// Marketing motion layer (v3) — mirrors the ui_kits/marketing inline script.
///
/// On mount it:
///   1. opts the document into the token motion layer via `data-animate`
///      on <html> (gates the .anim-*/.stagger utilities in datashuttle.css),
///   2. wires an IntersectionObserver scroll-reveal for `[data-reveal]`
///      elements (visible by default; we add `.pre` then `.in`),
///   3. runs count-up on `.ds-count[data-to]` numerals.
///
/// Everything is gated behind prefers-reduced-motion. Content is visible
/// with JS disabled — `.pre` is only ever added by this hook.

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    const root = document.documentElement
    const reduce =
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches

    root.setAttribute('data-animate', '')

    const reveals = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    )
    const counts = Array.from(
      document.querySelectorAll<HTMLElement>('.ds-count[data-to]'),
    )

    if (reduce) {
      reveals.forEach((el) => el.classList.add('in'))
      counts.forEach((el) => {
        const to = Number(el.dataset.to || '0')
        el.textContent = to.toLocaleString('en-US')
      })
      return
    }

    const revealIo = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    reveals.forEach((el) => {
      el.classList.add('pre')
      revealIo.observe(el)
    })

    function animateCount(el: HTMLElement) {
      const to = Number(el.dataset.to || '0')
      const fmt = (n: number) => n.toLocaleString('en-US')
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1100)
        el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const countIo = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target as HTMLElement)
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.5 },
    )
    counts.forEach((el) => countIo.observe(el))

    return () => {
      revealIo.disconnect()
      countIo.disconnect()
    }
    // Re-run on route change so newly-mounted page sections get observed.
  }, [pathname])
}
