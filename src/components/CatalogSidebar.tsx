import { NavLink, useLocation, useNavigate } from 'react-router-dom'

const linkClass =
  'block rounded-md px-3 py-2 text-sm font-medium text-brandcolor-textstrong transition-colors hover:bg-brandcolor-neutralhover'

const activeClass =
  'bg-brandcolor-secondaryfill text-brandcolor-secondary font-semibold'

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
  const location = useLocation()
  const navigate = useNavigate()
  const isCanvasMode = location.pathname === '/admin'

  const segmentBase =
    'flex-1 rounded-md px-2 py-2.5 text-center text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brandcolor-white'
  const segmentInactive =
    'text-brandcolor-textweak hover:bg-brandcolor-neutralhover hover:text-brandcolor-textstrong'
  const segmentActive = 'bg-brandcolor-primary text-brandcolor-white shadow-tab-option'

  return (
    <aside className="flex h-full min-h-0 w-60 shrink-0 flex-col border-r border-brandcolor-strokeweak bg-brandcolor-white shadow-sidebar-toggle">
      <div className="border-b border-brandcolor-strokeweak px-4 py-4">
        <NavLink
          to="/catalog/home"
          className="font-sans text-lg font-semibold text-brandcolor-textstrong"
        >
          Catalog
        </NavLink>
        <p className="mt-1 text-xs text-brandcolor-textweak">
          Component library
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-brandcolor-textweak">
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
        <p className="mt-4 px-3 pb-1 text-xs font-medium uppercase tracking-wide text-brandcolor-textweak">
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
      <div className="border-t border-brandcolor-strokeweak p-3">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-brandcolor-textweak">
          View
        </p>
        <div
          className="flex gap-0.5 rounded-lg border border-brandcolor-strokeweak bg-brandcolor-fill p-1"
          role="group"
          aria-label="Switch between catalog and canvas"
        >
          <button
            type="button"
            className={`${segmentBase} ${!isCanvasMode ? segmentActive : segmentInactive}`}
            aria-pressed={!isCanvasMode}
            onClick={() => navigate('/catalog/new')}
          >
            Catalog
          </button>
          <button
            type="button"
            className={`${segmentBase} ${isCanvasMode ? segmentActive : segmentInactive}`}
            aria-pressed={isCanvasMode}
            onClick={() => navigate('/admin')}
          >
            Canvas
          </button>
        </div>
      </div>
    </aside>
  )
}
