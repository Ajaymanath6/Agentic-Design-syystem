import { toCanvas } from 'html-to-image'

export type Rect = { x: number; y: number; w: number; h: number }

export type DetachedCaptureOptions = {
  /** Painted behind the node (avoids transparent PNG edge cases). */
  backgroundColor?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

/**
 * Capture a region of `element` (coordinates relative to element's client box).
 * Returns PNG data URL. Avoid on nodes under a CSS `transform` — use
 * {@link captureElementFullPng} instead.
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

function removeStaleCaptureHosts(): void {
  for (const el of document.querySelectorAll('[data-capture-detach-host]')) {
    el.remove()
  }
}

/**
 * Clone the node off-screen and capture the clone.
 * Use when the live node sits under a CSS `transform` (e.g. panned/zoomed canvas):
 * `html-to-image` often yields a blank bitmap in that case.
 */
export async function captureElementFullPngDetached(
  element: HTMLElement,
  options?: DetachedCaptureOptions,
): Promise<string> {
  removeStaleCaptureHosts()

  const w = Math.max(1, Math.round(element.offsetWidth))
  const baseH = Math.max(1, Math.round(element.offsetHeight))

  const host = document.createElement('div')
  host.setAttribute('data-capture-detach-host', 'true')
  host.style.position = 'fixed'
  host.style.left = '-12000px'
  host.style.top = '0'
  host.style.width = `${w}px`
  host.style.minHeight = `${baseH}px`
  host.style.margin = '0'
  host.style.padding = '0'
  host.style.overflow = 'hidden'
  host.style.pointerEvents = 'none'
  host.style.boxSizing = 'border-box'
  host.style.transform = 'none'

  const clone = element.cloneNode(true) as HTMLElement
  clone.style.position = 'relative'
  clone.style.left = '0'
  clone.style.top = '0'
  clone.style.margin = '0'
  clone.style.width = `${w}px`
  clone.style.maxWidth = `${w}px`
  clone.style.boxSizing = 'border-box'
  clone.style.transform = 'none'
  clone.style.willChange = 'auto'

  host.appendChild(clone)
  document.body.appendChild(host)

  await new Promise<void>((r) => requestAnimationFrame(() => r()))

  const h = Math.max(
    baseH,
    Math.round(Math.max(clone.scrollHeight, clone.offsetHeight)),
  )
  host.style.height = `${h}px`

  try {
    const canvas = await toCanvas(clone, {
      cacheBust: true,
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      width: w,
      height: h,
      backgroundColor: options?.backgroundColor ?? '#ffffff',
      skipFonts: true,
    })
    const dataUrl = canvas.toDataURL('image/png')
    if (!/^data:image\/png;base64,/i.test(dataUrl)) {
      throw new Error('Capture did not return a PNG data URL.')
    }
    return dataUrl
  } finally {
    host.remove()
    try {
      if (host.parentNode) {
        host.parentNode.removeChild(host)
      }
    } catch {
      /* ignore */
    }
  }
}

/**
 * Full-element PNG. Always uses detached capture so it works on the zoomed
 * canvas and matches layout publish behavior.
 */
export async function captureElementFullPng(
  element: HTMLElement,
  options?: DetachedCaptureOptions,
): Promise<string> {
  return captureElementFullPngDetached(element, {
    backgroundColor: '#ffffff',
    ...options,
  })
}
