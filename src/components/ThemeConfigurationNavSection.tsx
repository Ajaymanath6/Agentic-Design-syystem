import {
  GridFour,
  PaintBrush,
  Palette,
  SunDim,
  TextAa,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  SidebarDuotoneIcon,
  sidebarNavLabelClass,
  sidebarNavRowClass,
} from './SidebarDuotoneIcon'

const themeChildren: { to: string; label: string; icon: Icon }[] = [
  { to: '/catalog/theme/colors', label: 'Colors', icon: Palette },
  { to: '/catalog/theme/typography', label: 'Typography', icon: TextAa },
  { to: '/catalog/theme/shadows', label: 'Shadows', icon: SunDim },
  { to: '/catalog/theme/spacing', label: 'Spacing', icon: GridFour },
]

/** Nested theme links under Theme configuration in the catalog sidebar. */
export function ThemeConfigurationNavSection() {
  const { pathname } = useLocation()
  const themeSectionActive = pathname.startsWith('/catalog/theme')

  return (
    <div className="flex flex-col gap-2">
      <NavLink to="/catalog/theme/colors" className="block">
        <span className={sidebarNavRowClass(themeSectionActive)}>
          <SidebarDuotoneIcon icon={PaintBrush} active={themeSectionActive} />
          <span className={sidebarNavLabelClass(themeSectionActive)}>
            Theme configuration
          </span>
        </span>
      </NavLink>
      <ul
        className="ml-3 flex flex-col gap-2 border-l border-brandcolor-strokeweak pl-3"
        aria-label="Theme configuration sections"
      >
        {themeChildren.map(({ to, label, icon }) => {
          const childActive =
            pathname === to ||
            (to === '/catalog/theme/colors' && pathname === '/catalog/theme')
          return (
            <li key={to}>
              <NavLink to={to} className="block">
                <span className={sidebarNavRowClass(childActive)}>
                  <SidebarDuotoneIcon icon={icon} active={childActive} />
                  <span className={sidebarNavLabelClass(childActive)}>
                    {label}
                  </span>
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
