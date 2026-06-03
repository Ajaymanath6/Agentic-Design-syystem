import type { Icon } from '@phosphor-icons/react'
import { SIDEBAR_NAV_ICON_PX } from '../config/sidebar-layout'

type SidebarDuotoneIconProps = {
  icon: Icon
  active?: boolean
  size?: number
  className?: string
}

/** Phosphor duotone icon for sidebar nav — text-weak by default, text-strong when active. */
export function SidebarDuotoneIcon({
  icon: IconComponent,
  active = false,
  size = SIDEBAR_NAV_ICON_PX,
  className = '',
}: SidebarDuotoneIconProps) {
  return (
    <IconComponent
      size={size}
      weight="duotone"
      aria-hidden
      className={`shrink-0 ${
        active ? 'text-brandcolor-textstrong' : 'text-brandcolor-textweak'
      } ${className}`.trim()}
    />
  )
}

export function sidebarNavLabelClass(active: boolean): string {
  return active ? 'text-brandcolor-textstrong' : 'text-brandcolor-textweak'
}

export function sidebarNavRowClass(active: boolean): string {
  return `flex items-center gap-2 rounded-md px-3 py-2 text-[13px] transition-colors ${
    active
      ? 'bg-brandcolor-strokeweak text-brandcolor-textstrong'
      : 'text-brandcolor-textweak hover:bg-brandcolor-strokeweak'
  }`
}
