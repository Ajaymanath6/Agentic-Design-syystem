import { SidebarBrandHeader } from './SidebarBrandHeader'
import { ViewModeToggle } from './ViewModeToggle'

/**
 * Sidebar for /admin (canvas); same brand + view toggle as catalog, no catalog nav.
 */
export function CanvasSidebar() {
  return (
    <aside className="flex h-full min-h-0 w-60 shrink-0 flex-col border-r border-brandcolor-strokeweak bg-brandcolor-white">
      <SidebarBrandHeader />
      <div className="min-h-0 flex-1" />
      <ViewModeToggle />
    </aside>
  )
}
