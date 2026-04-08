import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

function mainTitleFromPath(pathname: string): string {
  if (
    pathname === '/admin' ||
    pathname === '/admin/canvas' ||
    pathname.startsWith('/admin/canvas/')
  )
    return 'Canvas'
  if (pathname === '/catalog/home') return 'Home'
  if (pathname === '/catalog/all') return 'All components'
  if (pathname === '/catalog/layouts') return 'Layouts'
  if (pathname === '/catalog/new') return 'New'
  return 'Catalog'
}

/** Shared top title for catalog and canvas (matches sidebar selection). */
export function CatalogMainHeader() {
  const { pathname } = useLocation()
  const title = useMemo(() => mainTitleFromPath(pathname), [pathname])

  return (
    <header className="flex min-h-[52px] shrink-0 items-center justify-center border-b border-brandcolor-strokeweak bg-brandcolor-white px-4 py-3 shadow-header c_md:px-6">
      <div className="mx-auto flex w-full max-w-6xl justify-center">
        <h1 className="font-sans text-lg font-semibold leading-tight text-brandcolor-textstrong">
          {title}
        </h1>
      </div>
    </header>
  )
}
