import { Link } from 'react-router-dom'

export default function Nav() {
  return (
    <nav className="ds-nav">
      <div className="ds-wrap row">
        <Link to="/" className="brand">
          <img src="/brand/logo-wordmark.svg" alt="DataShuttle" />
        </Link>
        <div className="links">
          <Link to="/product">Product</Link>
          <Link to="/deployment">Deployment</Link>
          <Link to="/pricing">Pricing</Link>
          <a href="https://docs.datashuttle.ai">Docs ↗</a>
          <Link to="/changelog">Changelog</Link>
          <Link to="/status">Status</Link>
        </div>
        <div className="cta">
          <a className="ds-btn ds-btn-ghost" href="https://app.datashuttle.ai">Sign in</a>
          <Link className="ds-btn ds-btn-secondary" to="/install">Install</Link>
          <a className="ds-btn ds-btn-primary" href="https://app.datashuttle.ai/signup">Create account</a>
        </div>
      </div>
    </nav>
  )
}
