import { NavLink } from 'react-router-dom'

type SidebarBrandHeaderProps = {
  title?: string
}

/** Shared top title for catalog and canvas sidebars. */
export function SidebarBrandHeader({
  title = 'De dev',
}: SidebarBrandHeaderProps) {
  return (
    <div className="flex min-h-[52px] shrink-0 items-center border-b border-brandcolor-strokeweak bg-brandcolor-white px-4 py-3 shadow-header">
      <NavLink
        to="/catalog/home"
        className="font-sans text-lg font-semibold leading-tight text-brandcolor-textstrong"
      >
        {title}
      </NavLink>
    </div>
  )
}
