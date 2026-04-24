import Hero from '../components/Hero'
import WhyIceberg from '../components/WhyIceberg'
import Pain from '../components/Pain'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import Partitioning from '../components/Partitioning'
import SqlDemo from '../components/SqlDemo'
import Comparison from '../components/Comparison'
import Connectors from '../components/Connectors'
import { SEO } from '../components/SEO'

// #633 — EarlyAccess component + its Node-relay container + the nginx
// /api/early-access location are all retired; the marketing CTA now
// routes straight to /cloud (public-beta signup on the React console).

export default function Home() {
  return (
    <>
      <SEO
        title="DataShuttle — Iceberg-Native Ingestion Engine"
        description="Move data from PostgreSQL, MySQL, MongoDB, Kafka into Iceberg tables with sub-minute latency. No Kafka cluster, no Flink, just SQL."
        path="/"
      />
      <Hero />
      <WhyIceberg />
      <Pain />
      <HowItWorks />
      <Features />
      <Partitioning />
      <SqlDemo />
      <Comparison />
      <Connectors />
    </>
  )
}
