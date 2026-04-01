import { toCanvas } from 'html-to-image'

export type Rect = { x: number; y: number; w: number; h: number }

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

/**
 * Capture a region of `element` (coordinates relative to element's client box).
 * Returns PNG data URL.
 */
export async function captureElementRegionPng(
  element: HTMLElement,
  rect: Rect,
): Promise<string> {
  const w = element.offsetWidth
  const h = element.offsetHeight
  const rx = clamp(rect.x, 0, w)
  const ry = clamp(rect.y, 0, h)
  const rw = clamp(rect.w, 1, w - rx)
  const rh = clamp(rect.h, 1, h - ry)

  const canvas = await toCanvas(element, {
    cacheBust: true,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  })

  const scaleX = canvas.width / w
  const scaleY = canvas.height / h
  const sx = Math.round(rx * scaleX)
  const sy = Math.round(ry * scaleY)
  const sw = Math.round(rw * scaleX)
  const sh = Math.round(rh * scaleY)

  const out = document.createElement('canvas')
  out.width = sw
  out.height = sh
  const ctx = out.getContext('2d')
  if (!ctx) throw new Error('Could not get 2d context')
  ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh)
  return out.toDataURL('image/png')
}

/** Capture the entire element as PNG (no drag region). */
export async function captureElementFullPng(
  element: HTMLElement,
): Promise<string> {
  const w = Math.max(1, element.offsetWidth)
  const h = Math.max(1, element.offsetHeight)
  return captureElementRegionPng(element, { x: 0, y: 0, w, h })
}
