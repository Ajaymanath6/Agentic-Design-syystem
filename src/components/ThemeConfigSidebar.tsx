import {
  GridFour,
  Palette,
  SunDim,
  TextAa,
} from '@phosphor-icons/react'
import { NavLink, useLocation } from 'react-router-dom'
import { CATALOG_CHROME_BG_CLASS, CATALOG_SIDEBAR_WIDTH_CLASS } from '../config/sidebar-layout'
import {
  SidebarDuotoneIcon,
  sidebarNavLabelClass,
  sidebarNavRowClass,
} from './SidebarDuotoneIcon'
import { SidebarBrandHeader } from './SidebarBrandHeader'
import { ViewModeToggle } from './ViewModeToggle'

const themeLinks = [
  { to: '/catalog/theme/colors', label: 'Colors', icon: Palette },
  { to: '/catalog/theme/typography', label: 'Typography', icon: TextAa },
  { to: '/catalog/theme/shadows', label: 'Shadows', icon: SunDim },
  { to: '/catalog/theme/spacing', label: 'Spacing', icon: GridFour },
] as const

/**
 * Sidebar for theme routes: brand, section links, then Catalog vs Canvas toggle.
 */
export function ThemeConfigSidebar() {
  const { pathname } = useLocation()

  return (
    <aside
      className={`flex h-full min-h-0 ${CATALOG_SIDEBAR_WIDTH_CLASS} max-w-[360px] shrink-0 flex-col border-r border-brandcolor-strokeweak ${CATALOG_CHROME_BG_CLASS}`}
    >
      <SidebarBrandHeader />
      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto p-3 text-[13px]"
        aria-label="Theme configuration sections"
      >
        <div className="shrink-0 px-1 pb-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-brandcolor-textweak">
            Theme
          </p>
          <p className="mt-1 text-[13px] font-semibold leading-snug text-brandcolor-textstrong">
            Theme configuration
          </p>
        </div>
        <ul className="flex flex-col gap-2 border-t border-brandcolor-strokeweak pt-2">
          {themeLinks.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink to={to} className="block">
                {({ isActive }) => (
                  <span
                    className={sidebarNavRowClass(isActive)}
                    aria-current={pathname === to ? 'page' : undefined}
                  >
                    <SidebarDuotoneIcon icon={icon} active={isActive} />
                    <span className={sidebarNavLabelClass(isActive)}>{label}</span>
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <ViewModeToggle />
    </aside>
  )
}
