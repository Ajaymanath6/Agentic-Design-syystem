import { RiOpenaiLine } from '@remixicon/react'
import { useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useCanvasChrome } from '../context/CanvasChromeContext'

function mainTitleFromPath(pathname: string): string {
  if (
    pathname === '/admin' ||
    pathname === '/admin/canvas' ||
    pathname.startsWith('/admin/canvas/')
  )
    return 'Canvas'
  if (pathname.startsWith('/catalog/theme')) return 'Theme configuration'
  if (pathname === '/catalog/home') return 'Home'
  if (pathname === '/catalog/all') return 'All components'
  if (pathname === '/catalog/layouts') return 'Layouts'
  if (pathname === '/catalog/new') return 'New'
  return 'Catalog'
}

function isAdminCanvasPath(pathname: string): boolean {
  return (
    pathname === '/admin' ||
    pathname === '/admin/canvas' ||
    pathname.startsWith('/admin/canvas/')
  )
}

const PLACEHOLDER_USER_INITIALS = 'CU'

/** Shared top title for catalog and canvas (matches sidebar selection). */
export function CatalogMainHeader() {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const { blockCount } = useCanvasChrome()
  const title = useMemo(() => mainTitleFromPath(pathname), [pathname])
  const isCanvasAdmin = isAdminCanvasPath(pathname)
  const isLayoutView = searchParams.get('view') === 'layout'
  const showBlockBadge = isCanvasAdmin && !isLayoutView

  const blockLabel = `${blockCount} UI block${blockCount === 1 ? '' : 's'} on canvas`

  return (
    <header className="flex min-h-[52px] shrink-0 items-center border-b border-brandcolor-strokeweak bg-brandcolor-white px-4 py-3 shadow-header c_md:px-6">
      {isCanvasAdmin ? (
        <div className="relative mx-auto flex w-full max-w-6xl min-h-[28px] items-center justify-end">
          <h1 className="pointer-events-none absolute left-1/2 top-1/2 w-[min(100%,12rem)] -translate-x-1/2 -translate-y-1/2 text-center font-lora text-theme-title-h5 font-theme-semibold text-brandcolor-textstrong">
            {title}
          </h1>
          <div className="flex min-w-0 shrink-0 items-center gap-2">
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
                <RiOpenaiLine className="size-4 shrink-0" aria-hidden />
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
        <div className="mx-auto flex w-full max-w-6xl justify-center">
          <h1 className="font-lora text-theme-title-h5 font-theme-semibold text-brandcolor-textstrong">
            {title}
          </h1>
        </div>
      )}
    </header>
  )
}
