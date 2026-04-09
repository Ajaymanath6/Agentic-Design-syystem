/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest'

import { sanitizeCanvasHtmlFragment } from './sanitize-canvas-html'

describe('sanitizeCanvasHtmlFragment', () => {
  it('keeps simple semantic markup', () => {
    const html = '<div class="p-4"><p>Hello</p></div>'
    expect(sanitizeCanvasHtmlFragment(html)).toContain('Hello')
    expect(sanitizeCanvasHtmlFragment(html)).toContain('class="p-4"')
  })

  it('removes script tags', () => {
    const html = '<div>ok</div><script>alert(1)</script>'
    const out = sanitizeCanvasHtmlFragment(html)
    expect(out).not.toMatch(/script/i)
    expect(out).toContain('ok')
  })

  it('removes inline event handlers', () => {
    const html = '<button onclick="alert(1)">x</button>'
    const out = sanitizeCanvasHtmlFragment(html)
    expect(out).not.toContain('onclick')
  })

  it('removes disallowed tags', () => {
    expect(sanitizeCanvasHtmlFragment('<iframe src="x"></iframe>')).toBe('')
  })
})
