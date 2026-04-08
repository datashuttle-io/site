import Nav from './components/Nav'
import Hero from './components/Hero'
import WhyIceberg from './components/WhyIceberg'
import Pain from './components/Pain'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Partitioning from './components/Partitioning'
import SqlDemo from './components/SqlDemo'
import Comparison from './components/Comparison'
import Connectors from './components/Connectors'
import EarlyAccess from './components/EarlyAccess'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white antialiased">
      <Nav />
      <main>
        <Hero />
        <WhyIceberg />
        <Pain />
        <HowItWorks />
        <Features />
        <Partitioning />
        <SqlDemo />
        <Comparison />
        <Connectors />
        <EarlyAccess />
      </main>
      <Footer />
    </div>
  )
}
