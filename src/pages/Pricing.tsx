/// /pricing — usage-based per-DPU rate, no tier breakdown.

import { SEO } from '../components/SEO'

const RATES = [
  { mode: 'Cloud (managed)', rate: '50¢', per: 'per DPU' },
  { mode: 'Self-hosted', rate: '20¢', per: 'per DPU, customer infrastructure' },
  { mode: 'Airgapped', rate: '30¢', per: 'per DPU, compliance-grade support' },
]

export default function Pricing() {
  return (
    <>
      <SEO
        title="Pricing — DataShuttle"
        description="Usage-based pricing. Pay per DPU (DataShuttle Processing Unit). 10,000 DPU free every month on cloud."
        path="/pricing"
      />
      <section className="bg-slate-950 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-medium uppercase tracking-widest mb-4">
              Pricing
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Pay per DPU.
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto">
              One metric, one rate. A DPU (DataShuttle Processing Unit) covers
              any of: 1&nbsp;GB ingested, 100k CDC events, 1 connector-hour, or
              1 vCPU-hour.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900/70 text-slate-300 text-sm">
                <tr>
                  <th className="py-4 pl-6 pr-3 font-medium">Deployment</th>
                  <th className="py-4 px-3 font-medium">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {RATES.map((r) => (
                  <tr key={r.mode}>
                    <td className="py-4 pl-6 pr-3 text-slate-100">{r.mode}</td>
                    <td className="py-4 px-3">
                      <span className="font-mono text-2xl text-indigo-300">
                        {r.rate}
                      </span>
                      <span className="ml-2 text-sm text-slate-400">
                        {r.per}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            10,000 DPU free every month on cloud. Committed-use discounts
            available on request — <a href="mailto:hello@datashuttle.ai" className="text-indigo-400 hover:text-indigo-300">hello@datashuttle.ai</a>.
          </p>
        </div>
      </section>
    </>
  )
}
