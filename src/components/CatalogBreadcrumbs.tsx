import { CaretRight } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { catalogBreadcrumbsFromPath } from '../lib/catalog-breadcrumbs'

/** Home → current page trail in the catalog chrome header. */
export function CatalogBreadcrumbs() {
  const { pathname } = useLocation()
  const crumbs = useMemo(
    () => catalogBreadcrumbsFromPath(pathname),
    [pathname],
  )

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 text-center">
      <ol className="flex min-w-0 flex-wrap items-center justify-center gap-0.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li
              key={`${crumb.label}-${index}`}
              className="flex min-w-0 items-center gap-0.5"
            >
              {index > 0 ? (
                <CaretRight
                  size={16}
                  weight="duotone"
                  className="shrink-0 text-brandcolor-textweak"
                  aria-hidden
                />
              ) : null}
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  className="truncate text-sm text-brandcolor-textweak transition-colors hover:text-brandcolor-textstrong"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={`truncate text-sm ${
                    isLast
                      ? 'font-semibold text-brandcolor-textstrong'
                      : 'text-brandcolor-textweak'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
