import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App.tsx'
import { CatalogRefreshProvider } from './context/CatalogRefreshContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CatalogRefreshProvider>
        <App />
      </CatalogRefreshProvider>
    </BrowserRouter>
  </StrictMode>,
)
