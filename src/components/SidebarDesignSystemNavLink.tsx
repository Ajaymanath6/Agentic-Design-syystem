import { NavLink } from 'react-router-dom'
import { RiPaintBrushLine, RiPaletteLine } from '@remixicon/react'

const linkBase =
  'flex items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2'

type Props = {
  /** Extra classes on the outer NavLink (e.g. canvas sidebar padding). */
  className?: string
}

/**
 * Catalog + canvas sidebars: Theme configuration (Remix paint + palette icons only).
 */
export function SidebarDesignSystemNavLink({ className = '' }: Props) {
  return (
    <NavLink
      to="/catalog/theme/colors"
      className={({ isActive }) =>
        `${linkBase} ${className} ${
          isActive
            ? 'bg-brandcolor-fill font-medium text-brandcolor-textstrong'
            : 'text-brandcolor-textweak hover:bg-brandcolor-fill hover:text-brandcolor-textstrong'
        }`.trim()
      }
    >
      <span
        className="flex shrink-0 items-center gap-0.5 text-brandcolor-strokestrong"
        aria-hidden
      >
        <RiPaintBrushLine className="size-[18px]" />
        <RiPaletteLine className="size-[18px]" />
      </span>
      <span className="min-w-0 leading-snug">Theme configuration</span>
    </NavLink>
  )
}
