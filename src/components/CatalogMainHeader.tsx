import { useLocation, useSearchParams } from 'react-router-dom'
import { useCanvasChrome } from '../context/CanvasChromeContext'
import { CatalogBreadcrumbs } from './CatalogBreadcrumbs'
import { SidebarExpandHeaderButton } from './SidebarExpandHeaderButton'

function isAdminCanvasPath(pathname: string): boolean {
  return (
    pathname === '/admin' ||
    pathname === '/admin/canvas' ||
    pathname.startsWith('/admin/canvas/')
  )
}

const PLACEHOLDER_USER_INITIALS = 'CU'

/** Catalog / canvas top chrome: centered breadcrumbs, sidebar expand, canvas actions. */
export function CatalogMainHeader() {
  const [searchParams] = useSearchParams()
  const { pathname } = useLocation()
  const { blockCount } = useCanvasChrome()
  const isCanvasAdmin = isAdminCanvasPath(pathname)
  const isLayoutView = searchParams.get('view') === 'layout'
  const showBlockBadge = isCanvasAdmin && !isLayoutView

  const blockLabel = `${blockCount} UI block${blockCount === 1 ? '' : 's'} on canvas`

  return (
    <header className="flex min-h-[52px] shrink-0 items-center border-b border-brandcolor-strokeweak px-4 py-3 c_md:px-6">
      {isCanvasAdmin ? (
        <div className="grid w-full min-h-[28px] grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex justify-start">
            <SidebarExpandHeaderButton />
          </div>
          <CatalogBreadcrumbs />
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-2">
            {showBlockBadge ? (
              <span
                role="status"
                aria-live="polite"
                aria-label={blockLabel}
                className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full border border-brandcolor-strokeweak bg-brandcolor-white px-2 text-[11px] font-medium tabular-nums text-brandcolor-textstrong"
              >
                {blockCount}
              </span>
            ) : null}
            <div
              className="inline-flex max-w-[min(100vw-8rem,240px)] items-center gap-2 rounded-full border border-brandcolor-strokeweak bg-brandcolor-white px-2.5 py-1 text-brandcolor-textweak"
              aria-label="Model providers for MCP"
            >
              <span className="inline-flex shrink-0 items-center gap-1">
                <img
                  src="/brands/cursor.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 shrink-0"
                />
                <img
                  src="/brands/anthropic.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 shrink-0"
                />
              </span>
              <span className="min-w-0 truncate text-[11px] font-medium text-brandcolor-textweak">
                Connect MCP
              </span>
            </div>
            <span
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-brandcolor-strokeweak bg-brandcolor-fill text-[11px] font-semibold text-brandcolor-textstrong"
              aria-label="User profile (placeholder)"
            >
              {PLACEHOLDER_USER_INITIALS}
            </span>
          </div>
        </div>
      ) : (
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex justify-start">
            <SidebarExpandHeaderButton />
          </div>
          <CatalogBreadcrumbs />
          <div className="w-9 shrink-0" aria-hidden />
        </div>
      )}
    </header>
  )
}
