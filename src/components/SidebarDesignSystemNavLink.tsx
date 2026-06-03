import { PaintBrush, Palette } from '@phosphor-icons/react'
import { NavLink } from 'react-router-dom'
import {
  SidebarDuotoneIcon,
  sidebarNavLabelClass,
  sidebarNavRowClass,
} from './SidebarDuotoneIcon'

type Props = {
  /** Extra classes on the outer NavLink (e.g. canvas sidebar padding). */
  className?: string
}

/** Catalog + canvas sidebars: Theme configuration link. */
export function SidebarDesignSystemNavLink({ className = '' }: Props) {
  return (
    <NavLink to="/catalog/theme/colors" className={`block ${className}`.trim()}>
      {({ isActive }) => (
        <span className={sidebarNavRowClass(isActive)}>
          <span className="flex shrink-0 items-center gap-0.5" aria-hidden>
            <SidebarDuotoneIcon icon={PaintBrush} active={isActive} />
            <SidebarDuotoneIcon icon={Palette} active={isActive} />
          </span>
          <span className={`min-w-0 leading-snug ${sidebarNavLabelClass(isActive)}`}>
            Theme configuration
          </span>
        </span>
      )}
    </NavLink>
  )
}
