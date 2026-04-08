import { describe, expect, it } from 'vitest'
import {
  FORMAT_HTML_DEFAULT_MAX_CHARS,
  formatHtmlForDisplay,
  formatHtmlFailureMessage,
} from './format-html-for-display'

describe('formatHtmlForDisplay', () => {
  it('formats well-formed HTML with line breaks', async () => {
    const raw =
      '<section><div class="a b"><p>hello</p><p>world</p></div></section>'
    const r = await formatHtmlForDisplay(raw)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.formatted).toContain('\n')
      expect(r.formatted).toContain('<section>')
      expect(r.formatted).toContain('hello')
    }
  })

  it('returns empty formatted for whitespace-only input', async () => {
    const r = await formatHtmlForDisplay('   \n\t  ')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.formatted).toBe('')
    }
  })

  it('skips Prettier when over maxChars', async () => {
    const chunk = '<p>x</p>'
    const raw = chunk.repeat(
      Math.ceil((FORMAT_HTML_DEFAULT_MAX_CHARS + 1) / chunk.length),
    )
    expect(raw.length).toBeGreaterThan(FORMAT_HTML_DEFAULT_MAX_CHARS)
    const r = await formatHtmlForDisplay(raw, {
      maxChars: FORMAT_HTML_DEFAULT_MAX_CHARS,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.reason).toBe('too_large')
      expect(r.fallback).toBe(raw)
    }
  })

  it('respects low maxChars without calling parser', async () => {
    const raw = '<div></div>'.repeat(50)
    const r = await formatHtmlForDisplay(raw, { maxChars: 20 })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.reason).toBe('too_large')
    }
  })

  it('returns parse_error fallback for severely broken markup without throwing', async () => {
    const raw = '<div><<<<<<<<<<'
    const r = await formatHtmlForDisplay(raw)
    expect(r).toBeDefined()
    if (!r.ok) {
      expect(r.fallback).toBe(raw)
      expect(['parse_error', 'too_large']).toContain(r.reason)
    }
  })

  it('returns cancelled when signal aborted before work', async () => {
    const c = new AbortController()
    c.abort()
    const r = await formatHtmlForDisplay('<p>ok</p>', { signal: c.signal })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.reason).toBe('cancelled')
    }
  })
})

describe('formatHtmlFailureMessage', () => {
  it('returns user-facing strings', () => {
    expect(formatHtmlFailureMessage('too_large')).toContain('too large')
    expect(formatHtmlFailureMessage('parse_error')).toContain('format')
    expect(formatHtmlFailureMessage('cancelled')).toBe('')
  })
})
