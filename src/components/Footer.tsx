export default function Footer() {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  return (
    <footer className="ds-foot">
      <div className="ds-foot-top">
        <div>
          <div className="sig">
            One binary.<br />
            <em>Any source.</em>
          </div>
          <div className="ds-foot-brand-tag">
            DataShuttle Labs, Inc. · Iceberg-native ingestion
          </div>
        </div>
        <div>
          <h5>Product</h5>
          <a href="/cloud">Cloud</a>
          <a href="/pricing">Pricing</a>
          <a href="/#capabilities">Features</a>
          <a href="/#sources">Sources</a>
          <a href="/whats-new">What's new</a>
        </div>
        <div>
          <h5>Developers</h5>
          <a href="https://docs.datashuttle.ai">Docs</a>
          <a href="/download">Download</a>
          <a href="https://github.com/datashuttle-ai/datashuttle">GitHub</a>
          <a href="https://github.com/datashuttle-ai/datashuttle/releases">Releases</a>
        </div>
        <div>
          <h5>Company</h5>
          <a href="mailto:hello@datashuttle.ai">hello@datashuttle.ai</a>
          <a href="mailto:sales@datashuttle.ai">sales@datashuttle.ai</a>
          <a href="https://app.datashuttle.ai">Sign in</a>
        </div>
      </div>
      <div className="ds-foot-legal">
        <div className="left">© {year} DATASHUTTLE LABS</div>
        <div className="center">
          BUILD {year}.{month}
        </div>
        <div className="right">ICEBERG V3 · RUST</div>
      </div>
    </footer>
  )
}
