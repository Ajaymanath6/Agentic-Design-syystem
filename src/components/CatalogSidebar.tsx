import { House, PaintBrush } from '@phosphor-icons/react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { CATALOG_CHROME_BG_CLASS, CATALOG_SIDEBAR_WIDTH_CLASS } from '../config/sidebar-layout'
import { SearchBar } from './SearchBar'
import {
  SidebarDuotoneIcon,
  sidebarNavLabelClass,
  sidebarNavRowClass,
} from './SidebarDuotoneIcon'
import { SidebarBrandHeader } from './SidebarBrandHeader'
import { SidebarComponentsExplorer } from './SidebarComponentsExplorer'
import { ViewModeToggle } from './ViewModeToggle'

type NavItem = {
  to: string
  label: string
  icon: typeof House
  activePathPrefix?: string
}

const primaryNav: NavItem[] = [
  { to: '/catalog/home', label: 'Home', icon: House },
  {
    to: '/catalog/theme/colors',
    label: 'Theme configuration',
    icon: PaintBrush,
    activePathPrefix: '/catalog/theme',
  },
]

function NavRow({ item }: { item: NavItem }) {
  const { to, label, icon, activePathPrefix } = item
  const location = useLocation()
  return (
    <NavLink to={to} className="block" end={to === '/catalog/home'}>
      {({ isActive }) => {
        const active =
          activePathPrefix != null
            ? location.pathname.startsWith(activePathPrefix)
            : isActive
        return (
          <span className={sidebarNavRowClass(active)}>
            <SidebarDuotoneIcon icon={icon} active={active} />
            <span className={sidebarNavLabelClass(active)}>{label}</span>
          </span>
        )
      }}
    </NavLink>
  )
}

export function CatalogSidebar() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <aside
      className={`flex h-full min-h-0 ${CATALOG_SIDEBAR_WIDTH_CLASS} max-w-[360px] shrink-0 flex-col border-r border-brandcolor-strokeweak ${CATALOG_CHROME_BG_CLASS}`}
    >
      <SidebarBrandHeader />
      <nav className="flex min-h-0 flex-1 flex-col gap-1 p-3 text-[13px] [&_input]:text-[13px] [&_label]:text-[13px]">
        <div className="flex shrink-0 flex-col gap-2">
          <SearchBar
            className="mb-1 px-0"
            placeholder="Search components…"
            value={searchQuery}
            onChange={setSearchQuery}
            id="catalog-sidebar-search"
          />
          {primaryNav.map((item) => (
            <NavRow key={item.to} item={item} />
          ))}
        </div>
        <SidebarComponentsExplorer />
      </nav>
      <ViewModeToggle />
    </aside>
  )
}
