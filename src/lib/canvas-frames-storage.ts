export type CanvasFrame = {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export const CANVAS_FRAMES_STORAGE_KEY = 'agentic-canvas-frames-v1'

export function loadCanvasFramesFromStorage(): CanvasFrame[] {
  try {
    const raw = localStorage.getItem(CANVAS_FRAMES_STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    const out: CanvasFrame[] = []
    for (const row of data) {
      if (!row || typeof row !== 'object') continue
      const o = row as Record<string, unknown>
      if (
        typeof o.id !== 'string' ||
        typeof o.x !== 'number' ||
        typeof o.y !== 'number' ||
        typeof o.w !== 'number' ||
        typeof o.h !== 'number'
      ) {
        continue
      }
      if (o.w <= 0 || o.h <= 0) continue
      out.push({
        id: o.id,
        x: o.x,
        y: o.y,
        w: o.w,
        h: o.h,
      })
    }
    return out
  } catch {
    return []
  }
}

export function persistCanvasFramesToStorage(frames: CanvasFrame[]) {
  try {
    localStorage.setItem(CANVAS_FRAMES_STORAGE_KEY, JSON.stringify(frames))
  } catch {
    /* quota / private mode */
  }
}
