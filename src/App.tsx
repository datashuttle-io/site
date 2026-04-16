import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Cloud from './pages/Cloud'
import Pricing from './pages/Pricing'
import WhatsNew from './pages/WhatsNew'
import Changelog from './pages/Changelog'

export default function App() {
  // /download page is temporarily removed — it will be rebuilt once
  // the public distribution channels are live (Docker Hub image,
  // Homebrew tap in a public repo, .deb/.rpm apt/dnf repos, macOS
  // .pkg installer). The previous version shipped fake download URLs
  // on a personal-repo path; reintroduce when every tab points at a
  // real public artifact.
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cloud" element={<Cloud />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="whats-new" element={<WhatsNew />} />
        <Route path="changelog" element={<Changelog />} />
      </Route>
    </Routes>
  )
}
