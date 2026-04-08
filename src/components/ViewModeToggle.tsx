import { useLocation, useNavigate } from 'react-router-dom'
import { RiArtboard2Line, RiBookOpenLine } from '@remixicon/react'

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
    'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-center text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brandcolor-white'
  const segmentInactive =
    'text-brandcolor-textweak hover:bg-brandcolor-neutralhover hover:text-brandcolor-textstrong'
  const segmentActive = 'bg-brandcolor-primary text-brandcolor-white'

  const outerClass =
    placement === 'embedded'
      ? 'mt-3 border-t border-brandcolor-strokeweak pt-3'
      : placement === 'footer'
        ? 'p-3'
        : 'border-t border-brandcolor-strokeweak p-3'

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
          className={`${segmentBase} ${!isCanvasMode ? segmentActive : segmentInactive}`}
          aria-pressed={!isCanvasMode}
          onClick={() => navigate('/catalog/home')}
        >
          <RiBookOpenLine className="size-4 shrink-0" aria-hidden />
          Catalog
        </button>
        <button
          type="button"
          className={`${segmentBase} ${isCanvasMode ? segmentActive : segmentInactive}`}
          aria-pressed={isCanvasMode}
          onClick={() => navigate('/admin/canvas')}
        >
          <RiArtboard2Line className="size-4 shrink-0" aria-hidden />
          Canvas
        </button>
      </div>
    </div>
  )
}
