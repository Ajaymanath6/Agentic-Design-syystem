import { Outlet, useLocation } from 'react-router-dom'
import { CanvasSidebar } from './CanvasSidebar'
import { CatalogMainHeader } from './CatalogMainHeader'
import { CatalogSidebar } from './CatalogSidebar'

export function CatalogLayout() {
  const isAdminCanvas = useLocation().pathname === '/admin'

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-brandcolor-results-bg">
      {isAdminCanvas ? <CanvasSidebar /> : <CatalogSidebar />}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-brandcolor-results-bg">
        <CatalogMainHeader />
        <div
          className={
            isAdminCanvas
              ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
              : 'min-h-0 min-w-0 w-full flex-1 overflow-y-auto overflow-x-hidden py-8'
          }
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
