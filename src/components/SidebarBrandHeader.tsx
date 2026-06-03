import { NavLink } from 'react-router-dom'
import { BRAND_NAME } from '../pages/landing/landing-content'

type SidebarBrandHeaderProps = {
  title?: string
}

/** Shared brand row for catalog and canvas sidebars (matches landing nav logo). */
export function SidebarBrandHeader({
  title = BRAND_NAME,
}: SidebarBrandHeaderProps) {
  return (
    <div className="flex min-h-[52px] shrink-0 items-center border-b border-brandcolor-strokeweak px-4 py-3">
      <NavLink
        to="/catalog/home"
        className="flex min-w-0 items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2"
      >
        <img
          src="/brand-logo.png"
          alt=""
          className="h-8 w-8 shrink-0 rounded-lg object-cover"
          width={32}
          height={32}
        />
        <span className="truncate font-sans text-sm font-semibold leading-tight text-brandcolor-textstrong">
          {title}
        </span>
      </NavLink>
    </div>
  )
}
