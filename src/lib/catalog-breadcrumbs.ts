export type CatalogBreadcrumb = {
  label: string
  to?: string
}

const HOME_CRUMB: CatalogBreadcrumb = { label: 'Home', to: '/catalog/home' }

const PAGE_TITLES: Record<string, string> = {
  '/catalog/all': 'All components',
  '/catalog/layouts': 'Layouts',
  '/catalog/new': 'New',
  '/catalog/categories': 'Categories',
  '/catalog/bookmarks': 'Bookmarks',
  '/catalog/prototype': 'Prototype',
  '/catalog/build-with-ami': 'Build with AMI',
  '/catalog/uni-search': 'Uni Search',
  '/catalog/uni-search/history': 'Uni Search History',
}

const THEME_SECTION_TITLES: Record<string, string> = {
  '/catalog/theme/colors': 'Colors',
  '/catalog/theme/typography': 'Typography',
  '/catalog/theme/shadows': 'Shadows',
  '/catalog/theme/spacing': 'Spacing',
}

function isCanvasPath(pathname: string): boolean {
  return (
    pathname === '/admin' ||
    pathname === '/admin/canvas' ||
    pathname.startsWith('/admin/canvas/')
  )
}

/** Breadcrumb trail for catalog / canvas chrome (Home → current page). */
export function catalogBreadcrumbsFromPath(pathname: string): CatalogBreadcrumb[] {
  if (pathname === '/catalog/home') {
    return [{ label: 'Home' }]
  }

  if (isCanvasPath(pathname)) {
    return [HOME_CRUMB, { label: 'Canvas' }]
  }

  if (pathname.startsWith('/catalog/theme')) {
    const section = THEME_SECTION_TITLES[pathname]
    if (section) {
      return [
        HOME_CRUMB,
        { label: 'Theme configuration', to: '/catalog/theme/colors' },
        { label: section },
      ]
    }
    return [HOME_CRUMB, { label: 'Theme configuration' }]
  }

  const pageTitle = PAGE_TITLES[pathname]
  if (pageTitle) {
    return [HOME_CRUMB, { label: pageTitle }]
  }

  return [HOME_CRUMB, { label: 'Catalog' }]
}
