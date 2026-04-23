import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import Footer from './Footer'
import '../styles/marketing.css'

export default function Layout() {
  // Tag the body so marketing-specific backdrop styles apply without
  // fighting the old slate-950 classes that used to own the shell.
  useEffect(() => {
    document.body.classList.add('ds-marketing')
    return () => {
      document.body.classList.remove('ds-marketing')
    }
  }, [])

  return (
    <div className="min-h-screen ds-marketing antialiased">
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
