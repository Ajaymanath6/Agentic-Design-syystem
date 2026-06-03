import { BookOpen, PresentationChart } from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  SidebarDuotoneIcon,
  sidebarNavLabelClass,
} from './SidebarDuotoneIcon'

export type ViewModeTogglePlacement = 'default' | 'embedded' | 'footer'

type ViewModeToggleProps = {
  /**
   * default — full-width strip (e.g. catalog sidebar).
   * embedded — under workspace toggle (top divider only).
   * footer — padding only; parent supplies border (e.g. canvas sidebar bottom).
   */
  placement?: ViewModeTogglePlacement
}

/**
 * Catalog vs canvas switcher; no outer border on the control group.
 */
export function ViewModeToggle({ placement = 'default' }: ViewModeToggleProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isCanvasMode =
    location.pathname === '/admin' ||
    location.pathname === '/admin/canvas' ||
    location.pathname.startsWith('/admin/canvas/')

  const segmentBase =
    'flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-2.5 text-center text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brandcolor-strokeweak focus-visible:ring-offset-1 focus-visible:ring-offset-brandcolor-fill'
  const segmentInactive =
    'border-transparent text-brandcolor-textweak hover:bg-brandcolor-white/70'
  const segmentActive =
    'border-brandcolor-strokeweak bg-brandcolor-white text-brandcolor-textstrong shadow-none'

  const outerClass =
    placement === 'embedded'
      ? 'mt-3 border-t border-brandcolor-strokeweak pt-3'
      : placement === 'footer'
        ? 'p-3'
        : 'border-t border-brandcolor-strokeweak p-3'

  const catalogActive = !isCanvasMode
  const canvasActive = isCanvasMode

  return (
    <div className={outerClass}>
      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-brandcolor-textweak">
        View
      </p>
      <div
        className="flex gap-0.5 rounded-lg bg-brandcolor-fill p-1"
        role="group"
        aria-label="Switch between catalog and canvas"
      >
        <button
          type="button"
          className={`${segmentBase} ${catalogActive ? segmentActive : segmentInactive}`}
          aria-pressed={catalogActive}
          onClick={() => navigate('/catalog/home')}
        >
          <SidebarDuotoneIcon icon={BookOpen} active={catalogActive} size={16} />
          <span className={sidebarNavLabelClass(catalogActive)}>Catalog</span>
        </button>
        <button
          type="button"
          className={`${segmentBase} ${canvasActive ? segmentActive : segmentInactive}`}
          aria-pressed={canvasActive}
          onClick={() => navigate('/admin/canvas')}
        >
          <SidebarDuotoneIcon
            icon={PresentationChart}
            active={canvasActive}
            size={16}
          />
          <span className={sidebarNavLabelClass(canvasActive)}>Canvas</span>
        </button>
      </div>
    </div>
  )
}
