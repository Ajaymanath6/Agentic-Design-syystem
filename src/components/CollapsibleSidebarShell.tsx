import { CaretLeft } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useCatalogSidebarCollapse } from '../context/CatalogSidebarCollapseContext'

/** Wraps a sidebar; hides entirely when collapsed and shows a mid-edge collapse control. */
export function CollapsibleSidebarShell({ children }: { children: ReactNode }) {
  const { collapsed, collapse } = useCatalogSidebarCollapse()

  if (collapsed) return null

  return (
    <div className="relative h-full shrink-0">
      {children}
      <button
        type="button"
        onClick={collapse}
        aria-label="Collapse sidebar"
        title="Collapse sidebar"
        className="absolute -right-3 top-1/2 z-30 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-brandcolor-strokeweak bg-brandcolor-textstrong shadow-card transition-colors hover:bg-brandcolor-secondaryhover focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-textstrong focus-visible:ring-offset-2"
      >
        <CaretLeft
          size={16}
          weight="duotone"
          className="text-brandcolor-white"
          aria-hidden
        />
      </button>
    </div>
  )
}
