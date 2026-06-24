import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import Footer from './Footer'
import { useReveal } from './useReveal'
import '../styles/marketing.css'

export default function Layout() {
  // Opt the document into the v3 motion layer + scroll-reveal / count-up.
  useReveal()
  return (
    <div
      className="min-h-screen antialiased"
      style={{ background: 'var(--bg)', color: 'var(--fg)' }}
    >
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
