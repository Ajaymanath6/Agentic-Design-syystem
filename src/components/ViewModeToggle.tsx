import { useLocation, useNavigate } from 'react-router-dom'
import { RiArtboard2Line, RiBookOpenLine } from '@remixicon/react'

/**
 * Catalog vs canvas switcher; no outer border on the control group.
 */
export function ViewModeToggle() {
  const location = useLocation()
  const navigate = useNavigate()
  const isCanvasMode = location.pathname === '/admin'

  const segmentBase =
    'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-center text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brandcolor-white'
  const segmentInactive =
    'text-brandcolor-textweak hover:bg-brandcolor-neutralhover hover:text-brandcolor-textstrong'
  const segmentActive = 'bg-brandcolor-primary text-brandcolor-white'

  return (
    <div className="border-t border-brandcolor-strokeweak p-3">
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
          onClick={() => navigate('/admin')}
        >
          <RiArtboard2Line className="size-4 shrink-0" aria-hidden />
          Canvas
        </button>
      </div>
    </div>
  )
}
