import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Product from './pages/Product'
import Deployment from './pages/Deployment'
import Pricing from './pages/Pricing'
import Install from './pages/Install'
import Status from './pages/Status'
import Changelog from './pages/Changelog'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="product" element={<Product />} />
        <Route path="deployment" element={<Deployment />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="install" element={<Install />} />
        <Route path="status" element={<Status />} />
        <Route path="changelog" element={<Changelog />} />
        {/* Renamed paths — keep old bookmarks working. /cloud was removed
            intentionally; bookmarks to it 404. */}
        <Route path="download" element={<Navigate to="/install" replace />} />
        <Route path="whats-new" element={<Navigate to="/changelog" replace />} />
      </Route>
    </Routes>
  )
}
