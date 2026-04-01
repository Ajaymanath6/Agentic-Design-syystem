import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import type { Rect } from '../../lib/capture-screenshot'

type Props = {
  active: boolean
  onComplete: (rect: Rect) => void
}

/**
 * Full-bleed overlay inside a positioned block; drag to select a region in
 * local (offset) coordinates.
 */
export function RectangleCaptureOverlay({
  active,
  onComplete,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [start, setStart] = useState<{ x: number; y: number } | null>(null)
  const [current, setCurrent] = useState<{ x: number; y: number } | null>(null)

  const localPoint = useCallback((clientX: number, clientY: number) => {
    const el = overlayRef.current
    if (!el) return { x: 0, y: 0 }
    const r = el.getBoundingClientRect()
    return { x: clientX - r.left, y: clientY - r.top }
  }, [])

  if (!active) return null

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const p = localPoint(e.clientX, e.clientY)
    setStart(p)
    setCurrent(p)
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !start) return
    setCurrent(localPoint(e.clientX, e.clientY))
  }

  const finish = (e: React.PointerEvent) => {
    if (!dragging) return
    setDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    const el = overlayRef.current
    if (!el || !start || !current) {
      return
    }
    const w = el.clientWidth
    const h = el.clientHeight
    const x1 = Math.min(start.x, current.x)
    const y1 = Math.min(start.y, current.y)
    const x2 = Math.max(start.x, current.x)
    const y2 = Math.max(start.y, current.y)
    let rw = x2 - x1
    let rh = y2 - y1
    let rx = x1
    let ry = y1
    if (rw < 4 || rh < 4) {
      rx = 0
      ry = 0
      rw = w
      rh = h
    }
    onComplete({ x: rx, y: ry, w: rw, h: rh })
    setStart(null)
    setCurrent(null)
  }

  let boxStyle: CSSProperties | undefined
  if (start && current) {
    const x1 = Math.min(start.x, current.x)
    const y1 = Math.min(start.y, current.y)
    const x2 = Math.max(start.x, current.x)
    const y2 = Math.max(start.y, current.y)
    boxStyle = {
      left: x1,
      top: y1,
      width: x2 - x1,
      height: y2 - y1,
    }
  }

  return (
    <div
      ref={overlayRef}
      data-capture-overlay=""
      className="absolute inset-0 z-10 cursor-crosshair bg-brandcolor-textstrong/10"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      {boxStyle && (
        <div
          className="pointer-events-none absolute border-2 border-dashed border-brandcolor-secondary bg-brandcolor-secondaryfill/30"
          style={boxStyle}
        />
      )}
      <p
        data-capture-only=""
        className="pointer-events-none absolute bottom-2 left-2 right-2 text-center text-xs text-brandcolor-textstrong"
      >
        Drag to select region (small drag = full block). Esc to cancel.
      </p>
    </div>
  )
}
