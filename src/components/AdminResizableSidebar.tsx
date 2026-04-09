import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'admin-sidebar-width-px'
const MIN_W = 240
const MAX_W = 575

function readStoredWidth(): number {
  try {
    const n = Number(localStorage.getItem(STORAGE_KEY))
    if (Number.isFinite(n)) return Math.min(MAX_W, Math.max(MIN_W, Math.round(n)))
  } catch {
    /* ignore */
  }
  return MIN_W
}

type Props = {
  children: React.ReactNode
}

/**
 * Wraps admin canvas sidebar; drag the right edge to resize between 240px and 575px.
 */
export function AdminResizableSidebar({ children }: Props) {
  const [width, setWidth] = useState(readStoredWidth)
  const widthRef = useRef(width)

  const dragRef = useRef<{ startX: number; startW: number } | null>(null)
  const handleRef = useRef<HTMLButtonElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  /** Same reference as `endDrag` for removeEventListener (avoids TDZ / stale self-ref). */
  const endDragRef = useRef<() => void>(() => {})

  const onPointerMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const next = Math.min(
      MAX_W,
      Math.max(MIN_W, d.startW + (e.clientX - d.startX)),
    )
    widthRef.current = next
    setWidth(next)
  }, [])

  const endDrag = useCallback(
    () => {
      const btn = handleRef.current
      if (btn && pointerIdRef.current != null) {
        try {
          btn.releasePointerCapture(pointerIdRef.current)
        } catch {
          /* ignore */
        }
        pointerIdRef.current = null
      }
      dragRef.current = null
      window.removeEventListener('pointermove', onPointerMove)
      const end = endDragRef.current
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      try {
        localStorage.setItem(STORAGE_KEY, String(widthRef.current))
      } catch {
        /* ignore */
      }
    },
    [onPointerMove],
  )

  useLayoutEffect(() => {
    endDragRef.current = endDrag
  }, [endDrag])

  useLayoutEffect(() => {
    widthRef.current = width
  }, [width])

  const onResizePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    pointerIdRef.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startW: widthRef.current }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
  }

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [endDrag, onPointerMove])

  return (
    <div
      className="relative shrink-0"
      style={{ width, minWidth: MIN_W, maxWidth: MAX_W }}
    >
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
        {children}
      </div>
      <button
        ref={handleRef}
        type="button"
        aria-label="Resize sidebar"
        title="Drag to resize"
        onPointerDown={onResizePointerDown}
        className="absolute right-0 top-0 z-30 h-full w-2 -translate-x-1/2 cursor-col-resize border-0 bg-transparent p-0 outline-none focus:outline-none active:bg-transparent"
      />
    </div>
  )
}
