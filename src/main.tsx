import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Self-hosted fonts (bundled woff2 from npm, served same-origin) — replaces the
// render-blocking Google Fonts <link> that hung first paint ~18s on throttled
// networks. Variable fonts cover every weight in one file each.
import '@fontsource-variable/inter-tight/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import '@fontsource-variable/source-serif-4/index.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
