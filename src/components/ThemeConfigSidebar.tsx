import {
  RiFontSize,
  RiLayoutGridLine,
  RiPaletteLine,
  RiShadowLine,
} from '@remixicon/react'
import { NavLink, useLocation } from 'react-router-dom'
import { SidebarBrandHeader } from './SidebarBrandHeader'
import { ViewModeToggle } from './ViewModeToggle'

const subLinkBase =
  'flex items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2'

function subLinkClass(isActive: boolean) {
  return `${subLinkBase} ${
    isActive
      ? 'bg-brandcolor-fill font-medium text-brandcolor-textstrong'
      : 'text-brandcolor-textweak hover:bg-brandcolor-fill hover:text-brandcolor-textstrong'
  }`
}

/**
 * Sidebar for theme routes: brand, “Theme configuration” heading, section links
 * (Colors / Typography / Shadows / Spacing), then Catalog vs Canvas (`ViewModeToggle`).
 */
export function ThemeConfigSidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="flex h-full min-h-0 w-60 shrink-0 flex-col border-r border-brandcolor-strokeweak bg-brandcolor-white">
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
        <ul className="flex flex-col gap-0.5 border-t border-brandcolor-strokeweak pt-2">
          <li>
            <NavLink
              to="/catalog/theme/colors"
              className={({ isActive }) => subLinkClass(isActive)}
              aria-current={pathname === '/catalog/theme/colors' ? 'page' : undefined}
            >
              <RiPaletteLine
                className="size-[18px] shrink-0 text-brandcolor-strokestrong"
                aria-hidden
              />
              Colors
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/catalog/theme/typography"
              className={({ isActive }) => subLinkClass(isActive)}
              aria-current={
                pathname === '/catalog/theme/typography' ? 'page' : undefined
              }
            >
              <RiFontSize
                className="size-[18px] shrink-0 text-brandcolor-strokestrong"
                aria-hidden
              />
              Typography
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/catalog/theme/shadows"
              className={({ isActive }) => subLinkClass(isActive)}
              aria-current={pathname === '/catalog/theme/shadows' ? 'page' : undefined}
            >
              <RiShadowLine
                className="size-[18px] shrink-0 text-brandcolor-strokestrong"
                aria-hidden
              />
              Shadows
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/catalog/theme/spacing"
              className={({ isActive }) => subLinkClass(isActive)}
              aria-current={pathname === '/catalog/theme/spacing' ? 'page' : undefined}
            >
              <RiLayoutGridLine
                className="size-[18px] shrink-0 text-brandcolor-strokestrong"
                aria-hidden
              />
              Spacing
            </NavLink>
          </li>
        </ul>
      </nav>
      <ViewModeToggle />
    </aside>
  )
}
