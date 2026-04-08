import { Outlet, useLocation } from 'react-router-dom'
import { LayoutWorkspaceProvider } from '../context/LayoutWorkspaceContext'
import { CanvasSidebar } from './CanvasSidebar'
import { CatalogMainHeader } from './CatalogMainHeader'
import { CatalogSidebar } from './CatalogSidebar'

export function CatalogLayout() {
  const pathname = useLocation().pathname
  const isAdminCanvas =
    pathname === '/admin' ||
    pathname === '/admin/canvas' ||
    pathname.startsWith('/admin/canvas/')

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-brandcolor-results-bg">
      {isAdminCanvas ? (
        <LayoutWorkspaceProvider>
          <CanvasSidebar />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-brandcolor-results-bg">
            <CatalogMainHeader />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <Outlet />
            </div>
          </main>
        </LayoutWorkspaceProvider>
      ) : (
        <>
          <CatalogSidebar />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-brandcolor-results-bg">
            <CatalogMainHeader />
            <div className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto overflow-x-hidden py-8">
              <Outlet />
            </div>
          </main>
        </>
      )}
    </div>
  )
}
