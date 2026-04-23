import { SEO } from '../components/SEO'

// The marketing home page is a single continuous "shipping manifest"
// document. Each section is a numbered entry (§ 01 – § 06). The orange
// signal color is a structural spine, not decoration.

export default function Home() {
  return (
    <>
      <SEO
        title="DataShuttle — Iceberg-Native Ingestion Engine"
        description="Move data from PostgreSQL, MySQL, MongoDB, Kafka into Apache Iceberg with one SQL statement. No Kafka, no Flink, no Spark."
        path="/"
      />

      <div className="ds-doc">
        <aside className="ds-spine">
          <div className="top-mark">MANIFEST · {manifestStamp()}</div>
          <div className="mark-box">
            <img src="/brand/logo-mark.svg" alt="" />
          </div>
          <div className="foot-mark">NO. 001 / 006</div>
        </aside>

        <div className="ds-main">
          <HeroSection />
          <TerminalSection />
          <StackCollapseSection />
          <CargoManifestSection />
          <RatesSection />
          <TestimonySection />
          <TariffSection />
        </div>
      </div>
    </>
  )
}

function manifestStamp() {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

/* ──────────────────────────────────────────────────────────────────
   § 01 — BILL OF LADING
   ────────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="ds-hero" id="hero">
      <div className="ds-hero-grid">
        <div className="ds-hero-meta">
          <span className="line">§ 01</span>
          <span className="line">BILL OF LADING</span>
          <span className="line">REV 2.1</span>
        </div>
        <div>
          <h1 className="ds-headline">
            <em>Any source.</em>
            <br />
            One binary.
            <br />
            <span className="accent">Landed in</span> Iceberg.
          </h1>
        </div>
      </div>

      <div className="ds-hero-below">
        <div>
          <p className="lede">
            The typical lakehouse ingestion stack is six tools glued together by a rotation
            of on-calls. DataShuttle replaces{' '}
            <strong>Kafka + Debezium + Flink + schema registry + custom glue</strong> with
            one binary driven by a single <code>CREATE&nbsp;PIPELINE</code> statement.
            Snapshot, CDC, schema evolution, deletion vectors — all in.
          </p>
          <div className="ds-cta-row">
            <span className="tick">BOOKING</span>
            <a className="primary" href="/cloud">
              Start a pipeline →
            </a>
            <a className="ghost" href="/download">
              ▸ 2-min demo
            </a>
          </div>
        </div>
        <div className="side">
          <div className="row"><span>Sources</span><strong>37</strong></div>
          <div className="row"><span>Runtime</span><strong>one binary</strong></div>
          <div className="row"><span>Target</span><strong>Apache Iceberg</strong></div>
          <div className="row"><span>Deploy</span><strong>cloud · self · airgap</strong></div>
          <div className="row"><span>First row</span><strong>~12s</strong></div>
          <div className="row"><span>Build</span><strong>{manifestStamp()}.02</strong></div>
        </div>
      </div>
    </section>
  )
}

/* Terminal block immediately after the hero */
function TerminalSection() {
  return (
    <section className="ds-terminal-wrap">
      <div className="ds-terminal">
        <div className="tbar">
          <span className="doc-id">DOC · PS_01HN8X2F4K</span>
          <span className="doc-name">pipeline.sql</span>
          <span className="doc-size">483 B · ASCII</span>
        </div>
        <div className="tbody">
          <div className="gutter">
            <div>01</div>
            <div>02</div>
            <div>03</div>
            <div>04</div>
            <div>05</div>
            <div>06</div>
            <div>&nbsp;</div>
            <div>&gt;</div>
            <div>&gt;</div>
            <div>&gt;</div>
          </div>
          <pre>
            <span className="com">-- Land every row from prod Postgres into Iceberg.</span>
            {'\n'}
            <span className="kw">CREATE PIPELINE</span> orders_sync{'\n'}
            <span className="kw">FROM</span>  postgres(<span className="str">'prod-db.internal'</span>, table =&gt; <span className="str">'public.orders'</span>){'\n'}
            <span className="kw">TO</span>    iceberg(<span className="str">'s3://lakehouse/orders'</span>){'\n'}
            <span className="kw">WITH</span>  (mode = <span className="str">'cdc+snapshot'</span>, schema_evolution = <span className="str">'auto'</span>);
            {'\n\n'}
            <span className="out">pipeline </span>
            <span className="str">'orders_sync'</span>
            <span className="out"> started in </span>
            <span className="num">1.2s</span>
            {'\n'}
            <span className="out">snapshot: </span>
            <span className="num">12,483,291</span>
            <span className="out"> rows in </span>
            <span className="num">142s</span>
            <span className="ok">   ✓</span>
            {'\n'}
            <span className="out">cdc:      lag </span>
            <span className="num">0.84s</span>
            <span className="out"> · rows/s </span>
            <span className="num">12,483</span>
            <span className="ok">   ✓</span>
          </pre>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────
   § 02 — Consolidation (stack collapse)
   ────────────────────────────────────────────────────────────────── */
function StackCollapseSection() {
  return (
    <section className="ds-sec" id="consolidation">
      <div className="ds-sec-head">
        <div className="ds-sec-num">§ 02</div>
        <div className="ds-sec-title">Consolidation</div>
        <div className="ds-sec-stamp">6 → 1</div>
      </div>

      <div className="ds-collapse">
        <div className="pair">
          <div>
            <div className="col-head">
              <h3>Before · typical stack</h3>
              <span className="cnt">6 components</span>
            </div>
            <div className="stack-list">
              <StackItem n="01" name="kafka" role="message broker" strike />
              <StackItem n="02" name="debezium" role="cdc connector" strike />
              <StackItem n="03" name="schema-registry" role="schema mgmt" strike />
              <StackItem n="04" name="flink" role="stream processing" strike />
              <StackItem n="05" name="airflow" role="orchestration" strike />
              <StackItem n="06" name="~6000 loc" role="custom glue" strike />
            </div>
          </div>

          <div className="arrow">
            <div className="arr">→</div>
          </div>

          <div>
            <div className="col-head">
              <h3>After · DataShuttle</h3>
              <span className="cnt">1 binary</span>
            </div>
            <div className="stack-list">
              <div className="stack-item datashuttle">
                <span className="n">01</span>
                <span className="name">datashuttle</span>
                <span className="role">one sql, one binary</span>
              </div>
              <StackItem n="✓" name="snapshot + cdc" role="built in" />
              <StackItem n="✓" name="schema evolution" role="automatic" />
              <StackItem n="✓" name="deletion vectors" role="native" />
              <StackItem n="✓" name="exactly-once" role="iceberg-coordinated" />
              <StackItem n="✓" name="cloud / self / airgap" role="same binary" />
            </div>
          </div>
        </div>

        <div className="sum">
          <div>
            <div className="big">6,000</div>
            <div className="lab">LINES OF GLUE DELETED</div>
          </div>
          <div className="eq">=</div>
          <div style={{ textAlign: 'right' }}>
            <div className="big">1</div>
            <div className="lab">SQL STATEMENT TO WRITE</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StackItem({ n, name, role, strike }: { n: string; name: string; role: string; strike?: boolean }) {
  return (
    <div className={`stack-item${strike ? ' strike' : ''}`}>
      <span className="n">{n}</span>
      <span className="name">{name}</span>
      <span className="role">{role}</span>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   § 03 — Cargo Manifest (features)
   ────────────────────────────────────────────────────────────────── */
function CargoManifestSection() {
  const rows = [
    {
      num: '01',
      code: 'CDC',
      title: "Change data capture that doesn't lose events.",
      desc: "Log-based CDC for Postgres, MySQL, Mongo, and SQL Server. Exactly-once delivery is guaranteed by Iceberg's commit protocol — not by a Kafka retention window you have to babysit.",
      spec: [
        ['SOURCES', 'pg · mysql · mongo · mssql'],
        ['GUARANTEE', 'exactly-once'],
        ['LATENCY', 'sub-second'],
      ],
    },
    {
      num: '02',
      code: 'SCHEMA',
      title: 'Schema evolution, on purpose.',
      desc: "Add a column upstream and it lands downstream. No DDL, no registry, no fire drill. Type changes and drops are promoted through Iceberg's evolution semantics automatically.",
      spec: [
        ['MODE', 'auto · strict'],
        ['CHANGES', 'add · drop · widen · rename'],
        ['BACKFILL', 'incremental'],
      ],
    },
    {
      num: '03',
      code: 'DELETES',
      title: 'Row-level deletes, natively.',
      desc: "Updates and deletes land as Iceberg v2 deletion vectors — not copy-on-write rewrites — so a busy OLTP source doesn't grind your lake into gravel over time.",
      spec: [
        ['FORMAT', 'iceberg v2'],
        ['COMPACTION', 'online'],
        ['RETENTION', 'tunable'],
      ],
    },
    {
      num: '04',
      code: 'DEPLOY',
      title: 'Cloud, self-hosted, or fully offline.',
      desc: 'The same binary runs in our managed cloud, in your VPC, or airgapped behind your firewall. Same SQL, same guarantees, same CLI. FedRAMP and IL-5 assistance available.',
      spec: [
        ['CLOUD', 'aws · gcp · azure'],
        ['SELF', 'docker · k8s'],
        ['AIRGAP', 'one tarball'],
      ],
    },
    {
      num: '05',
      code: 'DRIVE',
      title: 'SQL or console. Pick one.',
      desc: 'Every pipeline is a SQL statement, first-class. The console is an editor for that statement with live previews, backfill control, and metrics. GitOps-friendly by default.',
      spec: [
        ['API', 'sql · rest · cli'],
        ['GITOPS', 'yes'],
        ['IAC', 'terraform'],
      ],
    },
    {
      num: '06',
      code: 'OPS',
      title: 'One thing to page.',
      desc: 'One binary means one metric endpoint, one log stream, one status page. Rows/s, lag, backfill progress, commit latency — every pipeline, every region, one dashboard.',
      spec: [
        ['METRICS', 'prometheus'],
        ['LOGS', 'otlp'],
        ['SLA', '99.95%'],
      ],
    },
  ]

  return (
    <section className="ds-sec" id="cargo">
      <div className="ds-sec-head">
        <div className="ds-sec-num">§ 03</div>
        <div className="ds-sec-title">Cargo Manifest · what's in the binary</div>
        <div className="ds-sec-stamp">6 items</div>
      </div>

      <div className="ds-manifest-table">
        <div className="ds-manifest-row head">
          <div>item</div>
          <div>description</div>
          <div>technical spec</div>
          <div>status</div>
        </div>
        {rows.map((r) => (
          <div className="ds-manifest-row" key={r.num}>
            <div className="cell ds-m-num">
              {r.num}
              <br />
              {r.code}
            </div>
            <div className="cell ds-m-desc">
              <h4>{r.title}</h4>
              <p>{r.desc}</p>
            </div>
            <div className="cell ds-m-spec">
              {r.spec.map(([k, v]) => (
                <span key={k}>
                  <strong>{k}</strong> {v}
                  <br />
                </span>
              ))}
            </div>
            <div className="cell ds-m-stamp">
              <div className="st">SHIPPED</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────
   § 04 — Rates (metrics)
   ────────────────────────────────────────────────────────────────── */
function RatesSection() {
  return (
    <section className="ds-sec" id="rates">
      <div className="ds-sec-head">
        <div className="ds-sec-num">§ 04</div>
        <div className="ds-sec-title">Rates · measured under typical load</div>
        <div className="ds-sec-stamp">m5.4xlarge · single node</div>
      </div>

      <div className="ds-rates">
        <div className="ds-rate">
          <div className="lab">First-row latency</div>
          <div className="big">
            12<span className="u">sec</span>
          </div>
          <div className="foot">
            From <code>CREATE PIPELINE</code> to the first committed row in Iceberg.
          </div>
        </div>
        <div className="ds-rate">
          <div className="lab">Throughput · per node</div>
          <div className="big">
            1.4<span className="u">M r/s</span>
          </div>
          <div className="foot">
            Sustained rows per second on a single m5.4xlarge, scales horizontally.
          </div>
        </div>
        <div className="ds-rate">
          <div className="lab">Source connectors</div>
          <div className="big">37</div>
          <div className="foot">
            Operational databases, message brokers, object stores, SaaS APIs.
          </div>
        </div>
        <div className="ds-rate">
          <div className="lab">Binaries to deploy</div>
          <div className="big">1</div>
          <div className="foot">
            One process, one port, one config. No sidecars, no dependencies.
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────
   § 05 — Testimony
   ────────────────────────────────────────────────────────────────── */
function TestimonySection() {
  return (
    <section className="ds-sec" id="testimony">
      <div className="ds-sec-head">
        <div className="ds-sec-num">§ 05</div>
        <div className="ds-sec-title">Testimony · sworn statement</div>
        <div className="ds-sec-stamp">Parcelfold · Q3 2024</div>
      </div>

      <div className="ds-testimony">
        <div className="quote">
          <blockquote>
            We deleted <em>four services</em> and <em>six thousand lines</em> of glue the
            week we switched. The pager is quiet for the first time in two years.
          </blockquote>
        </div>
        <div className="byline">
          <div className="who">
            <strong>Priya R.</strong>
            <span>Staff Data Engineer</span>
          </div>
          <div className="co">
            <strong>Parcelfold, Inc.</strong>
            Global freight forwarding · 1,400 employees
            <div className="co-stats">
              <div className="s">
                <div className="n">−6,041</div>
                <div className="l">LINES DELETED</div>
              </div>
              <div className="s">
                <div className="n">−4</div>
                <div className="l">SERVICES RETIRED</div>
              </div>
              <div className="s">
                <div className="n">284M</div>
                <div className="l">ROWS / DAY</div>
              </div>
              <div className="s">
                <div className="n">99.99</div>
                <div className="l">UPTIME %</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────
   § 06 — Tariff (pricing)
   ────────────────────────────────────────────────────────────────── */
function TariffSection() {
  return (
    <section className="ds-sec" id="tariff">
      <div className="ds-sec-head">
        <div className="ds-sec-num">§ 06</div>
        <div className="ds-sec-title">Tariff · usage, not seats</div>
        <div className="ds-sec-stamp">Effective today</div>
      </div>

      <div className="ds-tariff">
        <div className="trow head">
          <div>tier</div>
          <div>scope</div>
          <div>rate</div>
          <div>included</div>
          <div></div>
        </div>

        <div className="trow">
          <div>
            <div className="tier">01 · OPEN</div>
            <div className="tname">Self-hosted</div>
          </div>
          <div>
            <div className="tdesc">
              The same binary, run wherever you want. Community support via GitHub and
              Slack. Up to 5 pipelines; unlimited rows.
            </div>
          </div>
          <div>
            <div className="rate-cell">
              $0<small>forever</small>
            </div>
          </div>
          <div>
            <div className="incl">
              <strong>37</strong> source connectors
              <br />
              <strong>5</strong> pipelines max
              <br />
              <strong>community</strong> support
            </div>
          </div>
          <div className="cta-cell">
            <a href="/download">Download binary</a>
          </div>
        </div>

        <div className="trow featured">
          <div>
            <div className="tier">02 · CLOUD</div>
            <div className="tname">Managed</div>
          </div>
          <div>
            <div className="tdesc">
              Fully managed runtime in our cloud or yours. SOC 2, HIPAA-ready. Regional
              deployment with 99.95% SLA. Support with 4-hour response.
            </div>
          </div>
          <div>
            <div className="rate-cell">
              $0.40<small>per 1M rows</small>
            </div>
          </div>
          <div>
            <div className="incl">
              <strong>unlimited</strong> pipelines
              <br />
              <strong>99.95</strong> SLA
              <br />
              <strong>4h</strong> response slack
            </div>
          </div>
          <div className="cta-cell">
            <a href="/cloud">Start free →</a>
          </div>
        </div>

        <div className="trow">
          <div>
            <div className="tier">03 · AIRGAP</div>
            <div className="tname">Offline</div>
          </div>
          <div>
            <div className="tdesc">
              Shipped as a signed tarball. Runs fully offline behind your firewall.
              FedRAMP / IL-5 assistance, dedicated SE, custom connectors on request.
            </div>
          </div>
          <div>
            <div className="rate-cell">
              contact<small>let's talk</small>
            </div>
          </div>
          <div>
            <div className="incl">
              <strong>offline</strong> runtime
              <br />
              <strong>FedRAMP</strong> assist
              <br />
              <strong>dedicated</strong> SE
            </div>
          </div>
          <div className="cta-cell">
            <a href="mailto:sales@datashuttle.ai">Contact sales</a>
          </div>
        </div>
      </div>
    </section>
  )
}
