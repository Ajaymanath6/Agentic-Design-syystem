import { Outlet, useLocation } from 'react-router-dom'
import { CatalogSidebar } from './CatalogSidebar'

export function CatalogLayout() {
  const isAdminCanvas = useLocation().pathname === '/admin'

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-brandcolor-results-bg">
      <CatalogSidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div
          className={
            isAdminCanvas
              ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
              : 'mx-auto min-h-0 w-full max-w-6xl flex-1 overflow-y-auto px-6 py-8'
          }
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
