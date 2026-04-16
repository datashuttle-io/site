import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Cloud from './pages/Cloud'
import Pricing from './pages/Pricing'
import Download from './pages/Download'
import WhatsNew from './pages/WhatsNew'
import Changelog from './pages/Changelog'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cloud" element={<Cloud />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="download" element={<Download />} />
        <Route path="whats-new" element={<WhatsNew />} />
        <Route path="changelog" element={<Changelog />} />
      </Route>
    </Routes>
  )
}
