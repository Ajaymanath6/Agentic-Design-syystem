import { Sidebar } from '@phosphor-icons/react'
import { useCatalogSidebarCollapse } from '../context/CatalogSidebarCollapseContext'

/** Header control to restore the sidebar when collapsed. */
export function SidebarExpandHeaderButton() {
  const { collapsed, expand } = useCatalogSidebarCollapse()

  if (!collapsed) return null

  return (
    <button
      type="button"
      onClick={expand}
      aria-label="Expand sidebar"
      title="Expand sidebar"
      className="flex size-9 shrink-0 items-center justify-center rounded-md text-brandcolor-textweak transition-colors hover:bg-brandcolor-fill hover:text-brandcolor-textstrong focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2"
    >
      <Sidebar size={20} weight="duotone" aria-hidden />
    </button>
  )
}
