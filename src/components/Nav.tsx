import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="ds-topbar">
        <div className="left">
          <Link to="/#cargo">Product</Link>
          <Link to="/#rates">Sources</Link>
          <Link to="/pricing">Pricing</Link>
          <a href="https://docs.datashuttle.ai">Docs</a>
        </div>
        <Link to="/" className="wordmark">
          <img src="/brand/logo-mark.svg" alt="" />
          <span>DataShuttle</span>
        </Link>
        <div className="right">
          <Link to="/whats-new">Changelog</Link>
          <a href="https://app.datashuttle.ai">Sign in</a>
          <Link to="/cloud" className="cta">
            Start a pipeline →
          </Link>
          <button
            className="hamburger"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            ≡
          </button>
        </div>
      </header>
      <div className={`ds-mobile-menu${open ? ' open' : ''}`}>
        <Link to="/cloud" onClick={() => setOpen(false)}>Cloud</Link>
        <Link to="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
        <Link to="/download" onClick={() => setOpen(false)}>Download</Link>
        <Link to="/whats-new" onClick={() => setOpen(false)}>Changelog</Link>
        <a href="https://docs.datashuttle.ai" onClick={() => setOpen(false)}>Docs</a>
        <a href="https://app.datashuttle.ai" onClick={() => setOpen(false)}>Sign in</a>
      </div>
    </>
  )
}
