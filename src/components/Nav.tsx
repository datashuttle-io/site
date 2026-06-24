import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Icon from './Icon'

const LINKS = [
  { to: '/product', label: 'Product' },
  { to: '/deployment', label: 'Deployment' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/changelog', label: 'Changelog' },
  { to: '/status', label: 'Status' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  // Lock body scroll while the mobile menu is open; always release on unmount.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <nav className="ds-nav" data-open={open || undefined}>
      <div className="ds-wrap row">
        <Link to="/" className="brand" onClick={close}>
          <img src="/brand/logo-wordmark.svg" alt="DataShuttle" />
        </Link>
        <div className="links">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to}>{l.label}</Link>
          ))}
          <a href="https://docs.datashuttle.ai">Docs ↗</a>
        </div>
        <div className="cta">
          <a className="ds-btn ds-btn-ghost" href="https://app.datashuttle.ai">Sign in</a>
          <Link className="ds-btn ds-btn-secondary" to="/install">Install</Link>
          <a className="ds-btn ds-btn-primary" href="https://app.datashuttle.ai/signup">Create account</a>
        </div>
        {/* Mobile: keep "Sign in" always reachable + a hamburger for the rest. */}
        <a className="ds-btn ds-btn-ghost signin-compact" href="https://app.datashuttle.ai">Sign in</a>
        <button
          type="button"
          className="menu-btn"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="ds-mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'x' : 'menu'} size={20} />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div id="ds-mobile-menu" className="mobile-menu" hidden={!open}>
        <div className="ds-wrap mm-inner">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={close}>{l.label}</Link>
          ))}
          <a href="https://docs.datashuttle.ai" onClick={close}>Docs ↗</a>
          <div className="mm-cta">
            <Link className="ds-btn ds-btn-secondary" to="/install" onClick={close}>Install</Link>
            <a className="ds-btn ds-btn-primary" href="https://app.datashuttle.ai/signup" onClick={close}>Create account</a>
          </div>
        </div>
      </div>
    </nav>
  )
}
