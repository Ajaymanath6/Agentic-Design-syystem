import { Outlet } from 'react-router-dom'
import { CatalogSidebar } from './CatalogSidebar'

export function CatalogLayout() {
  return (
    <div className="flex min-h-screen bg-brandcolor-results-bg">
      <CatalogSidebar />
      <main className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
