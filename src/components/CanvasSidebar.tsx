import { RiArtboard2Line, RiLayoutLine } from '@remixicon/react'
import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLayoutWorkspace } from '../context/LayoutWorkspaceContext'
import { SidebarBrandHeader } from './SidebarBrandHeader'
import { ViewModeToggle } from './ViewModeToggle'
import { WorkspacePromptComposer } from './workspace/WorkspacePromptComposer'

const segBase =
  'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-center text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brandcolor-white'
const segInactive =
  'text-brandcolor-textweak hover:bg-brandcolor-neutralhover hover:text-brandcolor-textstrong'
const segActive = 'bg-brandcolor-primary text-brandcolor-white'

function CanvasSidebarInner() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isLayout = searchParams.get('view') === 'layout'

  const {
    layoutPromptDraft,
    setLayoutPromptDraft,
    layoutPromptEntries,
    layoutPlanBusy,
    submitLayoutPrompt,
  } = useLayoutWorkspace()

  const setWorkspace = (next: 'components' | 'layout') => {
    setSearchParams(
      next === 'layout' ? { view: 'layout' } : {},
      { replace: true },
    )
  }

  return (
    <aside
      className="flex h-full min-h-0 w-60 shrink-0 flex-col border-r border-brandcolor-strokeweak bg-brandcolor-white"
      aria-label="Canvas sidebar"
    >
      <SidebarBrandHeader />
      <div className="shrink-0 border-b border-brandcolor-strokeweak p-3">
        <div
          className="flex gap-0.5 rounded-lg bg-brandcolor-fill p-1"
          role="group"
          aria-label="Components or layout workspace"
        >
          <button
            type="button"
            className={`${segBase} ${!isLayout ? segActive : segInactive}`}
            aria-pressed={!isLayout}
            onClick={() => setWorkspace('components')}
          >
            <RiArtboard2Line className="size-4 shrink-0" aria-hidden />
            Components
          </button>
          <button
            type="button"
            className={`${segBase} ${isLayout ? segActive : segInactive}`}
            aria-pressed={isLayout}
            onClick={() => setWorkspace('layout')}
          >
            <RiLayoutLine className="size-4 shrink-0" aria-hidden />
            Layout
          </button>
        </div>
      </div>

      {isLayout && layoutPromptEntries.length > 0 ? (
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

      {isLayout ? (
        <div className="shrink-0 border-t border-brandcolor-strokeweak p-3">
          <WorkspacePromptComposer
            variant="sidebar"
            textareaId="layout-workspace-prompt"
            value={layoutPromptDraft}
            onChange={setLayoutPromptDraft}
            onSubmit={() => submitLayoutPrompt()}
            busy={layoutPlanBusy}
            placeholder="Ask…"
          />
        </div>
      ) : null}

      {!isLayout ? (
        <div className="mt-auto shrink-0 border-t border-brandcolor-strokeweak">
          <ViewModeToggle placement="footer" />
        </div>
      ) : null}
    </aside>
  )
}

export function CanvasSidebar() {
  return (
    <Suspense fallback={null}>
      <CanvasSidebarInner />
    </Suspense>
  )
}
