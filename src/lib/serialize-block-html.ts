const CAPTURE_ONLY = 'data-capture-only'
const CAPTURE_OVERLAY = 'data-capture-overlay'

export function serializeBlockHtml(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement
  clone.querySelectorAll(`[${CAPTURE_ONLY}]`).forEach((n) => n.remove())
  clone.querySelectorAll(`[${CAPTURE_OVERLAY}]`).forEach((n) => n.remove())
  clone.removeAttribute(CAPTURE_ONLY)
  clone.removeAttribute(CAPTURE_OVERLAY)
  clone.querySelectorAll('*').forEach((el) => {
    el.removeAttribute(CAPTURE_ONLY)
    el.removeAttribute(CAPTURE_OVERLAY)
  })
  return clone.outerHTML
}
