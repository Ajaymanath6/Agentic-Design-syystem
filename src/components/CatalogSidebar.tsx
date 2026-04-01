import { NavLink } from 'react-router-dom'

const linkClass =
  'block rounded-md px-3 py-2 text-sm font-medium text-brandcolor-white/90 transition-colors hover:bg-brandcolor-sidebarhover'

const activeClass = 'bg-brandcolor-sidebarhover text-brandcolor-white'

type NavItem = { to: string; label: string }

const primaryNav: NavItem[] = [
  { to: '/catalog/home', label: 'Home' },
  { to: '/catalog/new', label: 'New' },
  { to: '/catalog/categories', label: 'Categories' },
  { to: '/catalog/bookmarks', label: 'Bookmarks' },
  { to: '/catalog/prototype', label: 'Prototype' },
]

const secondaryNav: NavItem[] = [
  { to: '/catalog/build-with-ami', label: 'Build with AMI' },
  { to: '/catalog/uni-search', label: 'Uni Search' },
  { to: '/catalog/uni-search/history', label: 'Uni Search History' },
]

export function CatalogSidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-brandcolor-divider bg-brandcolor-textstrong shadow-sidebar-toggle">
      <div className="border-b border-brandcolor-divider px-4 py-4">
        <NavLink
          to="/catalog/home"
          className="font-sans text-lg font-semibold text-brandcolor-white"
        >
          Catalog
        </NavLink>
        <p className="mt-1 text-xs text-brandcolor-white/70">
          Component library
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-brandcolor-white/50">
          Browse
        </p>
        {primaryNav.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ''}`
            }
            end={to === '/catalog/home'}
          >
            {label}
          </NavLink>
        ))}
        <p className="mt-4 px-3 pb-1 text-xs font-medium uppercase tracking-wide text-brandcolor-white/50">
          More
        </p>
        {secondaryNav.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-brandcolor-divider p-3">
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `block rounded-md px-3 py-2 text-center text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-brandcolor-primary text-brandcolor-white'
                : 'bg-brandcolor-sidebarhover text-brandcolor-white hover:bg-brandcolor-primaryhover'
            }`
          }
        >
          Admin canvas
        </NavLink>
      </div>
    </aside>
  )
}
