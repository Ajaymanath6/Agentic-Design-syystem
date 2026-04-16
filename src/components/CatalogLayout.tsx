import { Outlet, useLocation } from 'react-router-dom'
import { CanvasChromeProvider } from '../context/CanvasChromeContext'
import { LayoutWorkspaceProvider } from '../context/LayoutWorkspaceContext'
import { CanvasSidebar } from './CanvasSidebar'
import { CatalogMainHeader } from './CatalogMainHeader'
import { CatalogSidebar } from './CatalogSidebar'

export function CatalogLayout() {
  const pathname = useLocation().pathname
  const isThemeArea = pathname.startsWith('/catalog/theme')
  const isAdminCanvas =
    pathname === '/admin' ||
    pathname === '/admin/canvas' ||
    pathname.startsWith('/admin/canvas/')

  return (
    <CanvasChromeProvider>
      <div className="flex h-dvh min-h-0 overflow-hidden bg-brandcolor-results-bg">
      {isAdminCanvas ? (
        <LayoutWorkspaceProvider>
          <CanvasSidebar />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-brandcolor-results-bg font-sans text-theme-body-medium-regular leading-theme-body-medium-regular">
            <CatalogMainHeader />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <Outlet />
            </div>
          </main>
        </LayoutWorkspaceProvider>
      ) : isThemeArea ? (
        <Outlet />
      ) : (
        <>
          <CatalogSidebar />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-brandcolor-results-bg font-sans text-theme-body-medium-regular leading-theme-body-medium-regular">
            <CatalogMainHeader />
            <div className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto overflow-x-hidden py-8">
              <Outlet />
            </div>
          </main>
        </>
      )}
      </div>
    </CanvasChromeProvider>
  )
}
