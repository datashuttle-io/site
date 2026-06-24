/// /install — install-channel grid + OS detection.
///
/// Commands are pinned to install.sh + the Helm chart + the release-asset
/// names. Anything here that doesn't match those is a bug in this page,
/// not in the packaging shuttle.

import { useMemo, useState } from 'react'
import { SEO } from '../components/SEO'

interface InstallTab {
  key: string
  label: string
  command: string
  footnote?: string
  os?: Array<'linux' | 'windows'>
}

const TABS: InstallTab[] = [
  {
    key: 'server',
    label: 'systemd service',
    command:
      'curl -fsSL https://datashuttle.ai/install.sh | sudo bash -s -- --systemd',
    footnote:
      'Installs the `datashuttle` binary and drops a hardened systemd unit that runs `datashuttle start`. Includes 23 connectors. Run `sudo datashuttle setup --quickstart` after install.',
    os: ['linux'],
  },
  {
    key: 'docker',
    label: 'Docker',
    command: 'docker pull ghcr.io/datashuttle-io/datashuttle:latest',
    footnote:
      'Multi-arch image (linux/amd64 + linux/arm64). Includes 23 connectors. A working compose bundle lives under `deploy/` in the repo — use it as a reference stack, not a production template.',
    os: ['linux', 'windows'],
  },
  {
    key: 'deb',
    label: 'DEB (Debian/Ubuntu)',
    command: 'sudo dpkg -i datashuttle_<version>_amd64.deb',
    footnote:
      'Download the `.deb` from the latest GitHub Release. Ships the `datashuttle` binary + systemd unit. apt-repo landing in a follow-up release.',
    os: ['linux'],
  },
  {
    key: 'rpm',
    label: 'RPM (RHEL/Fedora)',
    command: 'sudo rpm -i datashuttle-<version>.x86_64.rpm',
    footnote:
      'Same pattern as the `.deb` — grab the `.rpm` from GitHub Releases. A dnf-repo is on the roadmap.',
    os: ['linux'],
  },
]

type OsKind = 'linux' | 'windows' | 'unknown'

function detectOs(): OsKind {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('win')) return 'windows'
  if (ua.includes('linux') || ua.includes('x11')) return 'linux'
  return 'unknown'
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // clipboard API blocked — ignore
        }
      }}
      className="ds-copy"
      aria-label="Copy command"
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  )
}

// Initial tab for a given OS — picked once at mount.
function defaultTabForOs(os: OsKind): string {
  if (os === 'windows') return 'docker'
  return 'server'
}

export default function Install() {
  // `navigator` exists on first render in the SPA, but guard for SSR/tests
  // via detectOs()'s own `typeof navigator` check. Lazy initializers keep
  // state in sync with the detected OS without a setState-in-effect round-trip.
  const [os] = useState<OsKind>(() => detectOs())
  const [active, setActive] = useState<string>(() => defaultTabForOs(detectOs()))

  const activeTab = useMemo(
    () => TABS.find((t) => t.key === active) ?? TABS[0],
    [active],
  )

  const renderFootnote = (text: string) => {
    // Render single-backtick `code` spans inline so footnotes retain their
    // monospaced identifiers without bringing in a markdown dep.
    const parts = text.split(/(`[^`]+`)/g)
    return parts.map((p, i) =>
      p.startsWith('`') && p.endsWith('`') ? (
        <code key={i}>{p.slice(1, -1)}</code>
      ) : (
        <span key={i}>{p}</span>
      ),
    )
  }

  return (
    <>
      <SEO
        title="Install DataShuttle"
        description="systemd, Docker, DEB, RPM — pick your platform. DataShuttle is proprietary software; Community tier is free to evaluate."
        path="/install"
        ogImage="og-download.jpg"
      />
      <div className="ds-wrap">
        <section className="ds-hero solo">
          <div data-reveal>
            <div className="eyebrow">
              <span className="pill">Self-hosted · early access</span>
              {os !== 'unknown' && (
                <span
                  style={{
                    font: '500 11px var(--font-mono)',
                    color: 'var(--fg-3)',
                    letterSpacing: '0.04em',
                    marginLeft: 6,
                  }}
                >
                  · detected {os}
                </span>
              )}
            </div>
            <h1>Run DataShuttle on your own infrastructure.</h1>
            <p className="lede">
              One Rust binary that serves as both CLI and long-running server,
              zero orchestration dependencies. DataShuttle is distributed under
              a proprietary license; the Community tier is free to evaluate,
              Team and above require a license file.
            </p>
          </div>
        </section>

        <section className="ds-sec">
          <div className="ds-sec-head" data-reveal>
            <div className="eyebrow">01 · install channels</div>
            <h2>Pick your packaging.</h2>
          </div>

          <div
            role="tablist"
            aria-label="Install channels"
            className="ds-tabs"
          >
            {TABS.map((t) => {
              const recommended = t.os?.includes(os as 'linux' | 'windows')
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={active === t.key}
                  onClick={() => setActive(t.key)}
                  className="ds-tab"
                >
                  {t.label}
                  {recommended && active !== t.key && (
                    <span className="osmark">✓ your OS</span>
                  )}
                </button>
              )
            })}
          </div>

          <div role="tabpanel" className="ds-cmd">
            <div className="top">
              <pre>
                <code>{activeTab.command}</code>
              </pre>
              <CopyButton text={activeTab.command} />
            </div>
            {activeTab.footnote && (
              <p className="footnote">{renderFootnote(activeTab.footnote)}</p>
            )}
            {(activeTab.key === 'deb' || activeTab.key === 'rpm') && (
              <p className="footnote">
                <a
                  href="https://github.com/datashuttle-io/releases/releases/latest"
                  target="_blank"
                  rel="noopener"
                >
                  Download the latest release asset →
                </a>
              </p>
            )}
          </div>
        </section>

        <section className="ds-sec">
          <div className="ds-sec-head" data-reveal>
            <div className="eyebrow">01a · direct downloads</div>
            <h2>Or grab a binary directly.</h2>
            <p>
              All assets ship with a sibling{' '}
              <code>.sha256</code> file — see <a href="#verify">step 02</a>{' '}
              before running on production. Current release{' '}
              <code>v0.7.2-rc1</code>; see the{' '}
              <a
                href="https://github.com/datashuttle-io/releases/releases"
                target="_blank"
                rel="noopener"
              >
                full releases page
              </a>
              .
            </p>
          </div>
          <div
            className="ds-features"
            style={{ gridTemplateColumns: 'repeat(3,1fr)' }}
          >
            <a
              className="ds-feat" data-reveal
              href="https://github.com/datashuttle-io/releases/releases/latest/download/datashuttle-linux-amd64.tar.gz"
              style={{ textDecoration: 'none' }}
            >
              <h4>Linux · x86_64 →</h4>
              <p>
                <code>datashuttle-linux-amd64.tar.gz</code> — ~50&nbsp;MB.
                Glibc 2.31+ (Debian 11+, Ubuntu 20.04+, RHEL 9+). Includes
                23 connectors.
              </p>
            </a>
            <a
              className="ds-feat" data-reveal
              href="https://github.com/datashuttle-io/releases/releases/latest/download/datashuttle-linux-arm64.tar.gz"
              style={{ textDecoration: 'none' }}
            >
              <h4>Linux · ARM64 →</h4>
              <p>
                <code>datashuttle-linux-arm64.tar.gz</code> — ~47&nbsp;MB.
                Graviton / Ampere / Raspberry Pi 5 etc. Includes 23
                connectors.
              </p>
            </a>
            <a
              className="ds-feat" data-reveal
              href="https://github.com/datashuttle-io/datashuttle/pkgs/container/datashuttle"
              target="_blank"
              rel="noopener"
              style={{ textDecoration: 'none' }}
            >
              <h4>Docker · multi-arch →</h4>
              <p>
                <code>ghcr.io/datashuttle-io/datashuttle:latest</code> —
                multi-arch (linux/amd64 + linux/arm64). Includes 23
                connectors.
              </p>
            </a>
            <a
              className="ds-feat" data-reveal
              href="https://github.com/datashuttle-io/releases/releases/latest"
              target="_blank"
              rel="noopener"
              style={{ textDecoration: 'none' }}
            >
              <h4>Debian / Ubuntu (.deb) →</h4>
              <p>
                Latest release page — filename embeds version
                (<code>datashuttle_&lt;ver&gt;_amd64.deb</code>). Then{' '}
                <code>sudo dpkg -i</code>.
              </p>
            </a>
            <a
              className="ds-feat" data-reveal
              href="https://github.com/datashuttle-io/releases/releases/latest"
              target="_blank"
              rel="noopener"
              style={{ textDecoration: 'none' }}
            >
              <h4>RHEL / Fedora (.rpm) →</h4>
              <p>
                Latest release page — filename embeds version
                (<code>datashuttle-&lt;ver&gt;-1.x86_64.rpm</code>). Then{' '}
                <code>sudo rpm -i</code>.
              </p>
            </a>
            <a
              className="ds-feat" data-reveal
              href="https://github.com/datashuttle-io/releases/releases/latest/download/datashuttle-chart.tgz"
              style={{ textDecoration: 'none' }}
            >
              <h4>Helm chart →</h4>
              <p>
                <code>datashuttle-chart.tgz</code>. For full Kubernetes
                installs, see the docs for ingress / persistent volumes.
              </p>
            </a>
          </div>
        </section>

        <section className="ds-sec" id="verify">
          <div className="ds-sec-head" data-reveal>
            <div className="eyebrow">02 · verify</div>
            <h2>Verify your download.</h2>
            <p>
              Every GitHub Release ships a SHA-256 checksum file alongside each
              binary. Verify before running on production.
            </p>
          </div>
          <div className="ds-verify">
            <pre>
{`# Download the binary + its checksum
curl -LO https://github.com/datashuttle-io/releases/releases/latest/download/datashuttle-<platform>.tar.gz
curl -LO https://github.com/datashuttle-io/releases/releases/latest/download/datashuttle-<platform>.tar.gz.sha256

# Verify
sha256sum -c datashuttle-<platform>.tar.gz.sha256`}
            </pre>
          </div>
        </section>

        <section className="ds-sec">
          <div className="ds-sec-head" data-reveal>
            <div className="eyebrow">03 · next steps</div>
            <h2>Where to go from here.</h2>
          </div>
          <div className="ds-features" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
            <a
              className="ds-feat" data-reveal
              href="https://docs.datashuttle.ai/quickstart"
              style={{ textDecoration: 'none' }}
            >
              <h4>Read the quickstart →</h4>
              <p>
                End-to-end tutorial: a Postgres source, a local MinIO warehouse,
                and the first Iceberg commit.
              </p>
            </a>
            <a
              className="ds-feat" data-reveal
              href="https://docs.datashuttle.ai/connectors/postgresql"
              style={{ textDecoration: 'none' }}
            >
              <h4>Connect your first source →</h4>
              <p>
                Postgres, MySQL, MongoDB, Kafka, Snowflake, BigQuery — all 23
                connectors ship in every install. One <code>CREATE CONNECTION</code>
                away.
              </p>
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
