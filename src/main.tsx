import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App.tsx'
import { CatalogRefreshProvider } from './context/CatalogRefreshContext.tsx'
import { applyThemeColorOverridesFromStorage } from './lib/theme-color-overrides'
import { applyThemeTokenOverridesFromStorage } from './lib/theme-token-overrides'
import './index.css'

applyThemeColorOverridesFromStorage()
applyThemeTokenOverridesFromStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CatalogRefreshProvider>
        <App />
      </CatalogRefreshProvider>
    </BrowserRouter>
  </StrictMode>,
)
