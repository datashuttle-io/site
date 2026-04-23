export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="ds-foot">
      <div className="ds-foot-top">
        <div>
          <div className="sig">
            One binary.<br />
            <em>Any source.</em>
          </div>
          <div className="ds-foot-brand-tag">
            DataShuttle Labs, Inc. · Shipping since 2024
          </div>
        </div>
        <div>
          <h5>Product</h5>
          <a href="/cloud">Cloud</a>
          <a href="/pricing">Pricing</a>
          <a href="/#cargo">Features</a>
          <a href="/whats-new">Changelog</a>
        </div>
        <div>
          <h5>Developers</h5>
          <a href="https://docs.datashuttle.ai">Docs</a>
          <a href="https://docs.datashuttle.ai/sql">SQL reference</a>
          <a href="/download">CLI</a>
          <a href="https://status.datashuttle.ai">Status</a>
        </div>
        <div>
          <h5>Company</h5>
          <a href="mailto:hello@datashuttle.ai">Contact</a>
          <a href="https://github.com/datashuttle-ai/datashuttle">GitHub</a>
          <a href="/cloud">Security</a>
        </div>
        <div>
          <h5>Legal</h5>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/dpa">DPA</a>
        </div>
      </div>
      <div className="ds-foot-legal">
        <div className="left">© {year} DATASHUTTLE LABS</div>
        <div className="center">
          MANIFEST NO. 001 · BUILD {year}.{String(new Date().getMonth() + 1).padStart(2, '0')}
        </div>
        <div className="right">SFO · NYC · REMOTE</div>
      </div>
    </footer>
  )
}
