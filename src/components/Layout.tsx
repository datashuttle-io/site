import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Nav from './Nav'
import Footer from './Footer'
import '../styles/marketing.css'

/// Scrolls to an element matching the URL hash after every navigation.
/// React Router does not do this by default — a <Link to="/#sources">
/// click changes the URL but leaves the viewport at the top, which
/// makes our in-page nav anchors look dead.
function ScrollToHash() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      return
    }
    // Wait one frame so the target section is in the DOM before we
    // measure its position — the home page renders sections lazily via
    // inline React children, and getElementById() will return null if
    // we call it before the reconciler has committed the tree.
    const target = hash.slice(1)
    const tries = [0, 50, 150, 300]
    const timers = tries.map((delay) =>
      window.setTimeout(() => {
        const el = document.getElementById(target)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, delay),
    )
    return () => timers.forEach(window.clearTimeout)
  }, [pathname, hash])
  return null
}

export default function Layout() {
  // Tag the body so marketing-specific backdrop styles apply without
  // fighting the old slate-950 classes that used to own the shell.
  useEffect(() => {
    document.body.classList.add('ds-marketing')
    return () => {
      document.body.classList.remove('ds-marketing')
    }
  }, [])

  return (
    <div className="min-h-screen ds-marketing antialiased">
      <ScrollToHash />
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
