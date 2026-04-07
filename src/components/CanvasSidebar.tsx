import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpLine,
  RiArtboard2Line,
  RiCropLine,
  RiLayoutLine,
  RiLoader4Line,
} from '@remixicon/react'
import { useMemo } from 'react'
import { useAdminWorkspace } from '../context/AdminWorkspaceContext'
import { useCatalogCards } from '../hooks/useCatalogCards'
import { buildCatalogAllowlist } from '../lib/layout-plan-catalog'
import { AdminResizableSidebar } from './AdminResizableSidebar'
import { SidebarBrandHeader } from './SidebarBrandHeader'
import { ViewModeToggle } from './ViewModeToggle'

const segBase =
  'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-center text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2'
const segInactive =
  'text-brandcolor-textweak hover:bg-brandcolor-neutralhover hover:text-brandcolor-textstrong'
const segActive = 'bg-brandcolor-primary text-brandcolor-white'

/**
 * Sidebar for /admin: fixed width in Components; resizable (240–575px) in Layout with bottom prompt.
 */
export function CanvasSidebar() {
  const {
    mode,
    setMode,
    layoutPromptDraft,
    setLayoutPromptDraft,
    layoutPromptEntries,
    submitLayoutPrompt,
    layoutPlanBusy,
  } = useAdminWorkspace()
  const { cards } = useCatalogCards()
  const catalogAllowlist = useMemo(
    () => buildCatalogAllowlist(cards),
    [cards],
  )

  const aside = (
    <aside
      className={`flex h-full min-h-0 flex-col border-r border-brandcolor-strokeweak bg-brandcolor-white ${
        mode === 'layout' ? 'w-full min-w-0' : 'w-60 shrink-0'
      }`}
    >
      <SidebarBrandHeader />
      <div className="shrink-0 border-b border-brandcolor-strokeweak p-3">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-brandcolor-textweak">
          Workspace
        </p>
        <div
          className="flex gap-0.5 rounded-lg bg-brandcolor-fill p-1"
          role="group"
          aria-label="Components or layout workspace"
        >
          <button
            type="button"
            className={`${segBase} ${mode === 'canvas' ? segActive : segInactive}`}
            aria-pressed={mode === 'canvas'}
            onClick={() => setMode('canvas')}
          >
            <RiArtboard2Line className="size-4 shrink-0" aria-hidden />
            Components
          </button>
          <button
            type="button"
            className={`${segBase} ${mode === 'layout' ? segActive : segInactive}`}
            aria-pressed={mode === 'layout'}
            onClick={() => setMode('layout')}
          >
            <RiLayoutLine className="size-4 shrink-0" aria-hidden />
            Layout
          </button>
        </div>
      </div>

      {mode === 'layout' && layoutPromptEntries.length > 0 ? (
        <div className="sidebar-scroll-lean min-h-0 flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-2 text-[13px] text-brandcolor-textstrong">
            {layoutPromptEntries.map((line, i) => (
              <li
                key={`${i}-${line.slice(0, 24)}`}
                className="rounded-md bg-brandcolor-fill px-2 py-1.5"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="min-h-0 flex-1" />
      )}

      {mode === 'canvas' ? (
        <ViewModeToggle />
      ) : (
        <div className="shrink-0 border-t border-brandcolor-strokeweak p-3">
          <div className="rounded-xl border border-brandcolor-strokeweak bg-brandcolor-fill p-2">
            <textarea
              value={layoutPromptDraft}
              onChange={(e) => setLayoutPromptDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submitLayoutPrompt(catalogAllowlist)
                }
              }}
              placeholder="Ask…"
              rows={3}
              disabled={layoutPlanBusy}
              className="mb-2 w-full resize-none rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white px-2.5 py-2 text-[13px] text-brandcolor-textstrong placeholder:text-brandcolor-textweak focus:outline-none focus:ring-2 focus:ring-brandcolor-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-brandcolor-strokeweak bg-brandcolor-white text-brandcolor-textstrong hover:bg-brandcolor-neutralhover"
                aria-label="Add"
              >
                <RiAddLine className="size-4" />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-[11px] font-medium text-brandcolor-textstrong hover:bg-brandcolor-neutralhover"
              >
                <RiCropLine className="size-3.5" aria-hidden />
                Visual edits
              </button>
              <span className="flex-1" />
              <button
                type="button"
                className="inline-flex items-center gap-0.5 rounded-full border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-[11px] font-medium text-brandcolor-textstrong hover:bg-brandcolor-neutralhover"
              >
                Build
                <RiArrowDownSLine className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => submitLayoutPrompt(catalogAllowlist)}
                disabled={layoutPlanBusy}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brandcolor-primary text-brandcolor-white shadow-sm hover:bg-brandcolor-primaryhover disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send prompt"
                title="Send"
                aria-busy={layoutPlanBusy}
              >
                {layoutPlanBusy ? (
                  <RiLoader4Line className="size-4 animate-spin" aria-hidden />
                ) : (
                  <RiArrowUpLine className="size-4" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )

  if (mode === 'layout') {
    return <AdminResizableSidebar>{aside}</AdminResizableSidebar>
  }
  return aside
}
