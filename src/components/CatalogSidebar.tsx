import type { ComponentType } from 'react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { RiHome4Line, RiPaintBrushLine } from '@remixicon/react'
import { SearchBar } from './SearchBar'
import { SidebarBrandHeader } from './SidebarBrandHeader'
import { SidebarComponentsExplorer } from './SidebarComponentsExplorer'
import { ViewModeToggle } from './ViewModeToggle'

const linkBase =
  'flex items-center gap-2 rounded-md px-3 py-2 transition-colors'

type NavItem = {
  to: string
  label: string
  Icon: ComponentType<{ className?: string; size?: number | string }>
  /** When set, highlight whenever the path starts with this (e.g. all theme sub-routes). */
  activePathPrefix?: string
}

const primaryNav: NavItem[] = [
  { to: '/catalog/home', label: 'Home', Icon: RiHome4Line },
  {
    to: '/catalog/theme/colors',
    label: 'Theme configuration',
    Icon: RiPaintBrushLine,
    activePathPrefix: '/catalog/theme',
  },
]

function NavRow({ item }: { item: NavItem }) {
  const { to, label, Icon, activePathPrefix } = item
  const location = useLocation()
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        const active =
          activePathPrefix != null
            ? location.pathname.startsWith(activePathPrefix)
            : isActive
        return `${linkBase} ${
          active
            ? 'bg-brandcolor-fill text-brandcolor-textstrong'
            : 'text-brandcolor-textweak hover:bg-brandcolor-fill'
        }`
      }}
      end={to === '/catalog/home'}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      <span>{label}</span>
    </NavLink>
  )
}

export function CatalogSidebar() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <aside className="flex h-full min-h-0 w-60 shrink-0 flex-col border-r border-brandcolor-strokeweak bg-brandcolor-white">
      <SidebarBrandHeader />
      <nav className="flex min-h-0 flex-1 flex-col gap-1 p-3 text-[13px] [&_input]:text-[13px] [&_label]:text-[13px]">
        <div className="flex shrink-0 flex-col gap-1">
          <p className="px-3 pb-1 text-[13px] font-medium uppercase tracking-wide text-brandcolor-textweak">
            Browse
          </p>
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
