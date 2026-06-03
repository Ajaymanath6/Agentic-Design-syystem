import { Outlet, useLocation } from 'react-router-dom'
import { CanvasChromeProvider } from '../context/CanvasChromeContext'
import { CatalogSidebarCollapseProvider } from '../context/CatalogSidebarCollapseContext'
import { LayoutWorkspaceProvider } from '../context/LayoutWorkspaceContext'
import { CanvasSidebar } from './CanvasSidebar'
import { CatalogMainHeader } from './CatalogMainHeader'
import { CatalogSidebar } from './CatalogSidebar'
import { CATALOG_CHROME_BG_CLASS } from '../config/sidebar-layout'
import { CollapsibleSidebarShell } from './CollapsibleSidebarShell'

export function CatalogLayout() {
  const pathname = useLocation().pathname
  const isThemeArea = pathname.startsWith('/catalog/theme')
  const isAdminCanvas =
    pathname === '/admin' ||
    pathname === '/admin/canvas' ||
    pathname.startsWith('/admin/canvas/')

  return (
    <CanvasChromeProvider>
      <CatalogSidebarCollapseProvider>
        <div className="flex h-dvh min-h-0 overflow-hidden bg-brandcolor-results-bg">
          {isAdminCanvas ? (
            <LayoutWorkspaceProvider>
              <CollapsibleSidebarShell>
                <CanvasSidebar />
              </CollapsibleSidebarShell>
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
              <CollapsibleSidebarShell>
                <CatalogSidebar />
              </CollapsibleSidebarShell>
              <main
                className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden font-sans text-theme-body-medium-regular leading-theme-body-medium-regular ${
                  pathname === '/catalog/home'
                    ? CATALOG_CHROME_BG_CLASS
                    : 'bg-brandcolor-results-bg'
                }`}
              >
                <CatalogMainHeader />
                <div
                  className={`min-h-0 min-w-0 w-full flex-1 overflow-y-auto overflow-x-hidden ${
                    pathname === '/catalog/home'
                      ? `${CATALOG_CHROME_BG_CLASS} py-0`
                      : 'bg-brandcolor-results-bg py-8'
                  }`}
                >
                  <Outlet />
                </div>
              </main>
            </>
          )}
        </div>
      </CatalogSidebarCollapseProvider>
    </CanvasChromeProvider>
  )
}
