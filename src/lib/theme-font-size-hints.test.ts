import { describe, expect, it } from 'vitest'
import {
  fontSizeInputHint,
  lineBoxHeightHint,
  ROOT_PX_DEFAULT,
  stepFontSizeValue,
  stepLineHeightValue,
} from './theme-font-size-hints'

describe('fontSizeInputHint', () => {
  it('maps rem to px at default root', () => {
    const h = fontSizeInputHint('0.875rem')
    expect(h).toContain('14')
    expect(h).toContain(String(ROOT_PX_DEFAULT))
  })

  it('maps px to rem at default root', () => {
    const h = fontSizeInputHint('14px')
    expect(h).toContain('0.875')
    expect(h).toContain(String(ROOT_PX_DEFAULT))
  })

  it('respects custom root px', () => {
    expect(fontSizeInputHint('1rem', 10)).toContain('10px')
    expect(fontSizeInputHint('10px', 10)).toContain('1rem')
  })

  it('returns null for em, invalid, empty', () => {
    expect(fontSizeInputHint('')).toBeNull()
    expect(fontSizeInputHint('1em')).toBeNull()
    expect(fontSizeInputHint('bad')).toBeNull()
    expect(fontSizeInputHint('  ')).toBeNull()
  })

  it('rounds px to one decimal when non-integer', () => {
    const h = fontSizeInputHint('0.5625rem')
    expect(h).toMatch(/9px/)
  })
})

describe('stepFontSizeValue', () => {
  it('steps rem by 0.001', () => {
    expect(stepFontSizeValue('0.875rem', 1)).toBe('0.876rem')
    expect(stepFontSizeValue('0.875rem', -1)).toBe('0.874rem')
  })

  it('clamps rem at minimum 0.001rem', () => {
    expect(stepFontSizeValue('0.001rem', -1)).toBe('0.001rem')
  })

  it('steps px by 1', () => {
    expect(stepFontSizeValue('14px', 1)).toBe('15px')
    expect(stepFontSizeValue('14px', -1)).toBe('13px')
  })

  it('returns null when value is not a full rem/px token', () => {
    expect(stepFontSizeValue('incomplete', 1)).toBeNull()
    expect(stepFontSizeValue('0.875', 1)).toBeNull()
    expect(stepFontSizeValue('1em', 1)).toBeNull()
  })
})

describe('stepLineHeightValue', () => {
  it('steps unitless line height by 0.001', () => {
    expect(stepLineHeightValue('1.625', 1)).toBe('1.626')
    expect(stepLineHeightValue('1.625', -1)).toBe('1.624')
  })

  it('clamps at zero', () => {
    expect(stepLineHeightValue('0', -1)).toBe('0')
    expect(stepLineHeightValue('0.001', -1)).toBe('0')
  })

  it('returns null for partial or invalid tokens', () => {
    expect(stepLineHeightValue('1.', 1)).toBeNull()
    expect(stepLineHeightValue('', 1)).toBeNull()
  })
})

describe('lineBoxHeightHint', () => {
  it('combines rem font size with line height', () => {
    const h = lineBoxHeightHint('0.875rem', '1.625')
    expect(h).toMatch(/line box/)
    expect(h).toMatch(/22\.8|22\.75/) // 0.875 * 16 * 1.625 = 22.75 → 22.8
  })

  it('combines px font size with line height', () => {
    expect(lineBoxHeightHint('14px', '2')).toContain('28')
    expect(lineBoxHeightHint('14px', '2')).toMatch(/line box/)
  })

  it('returns null when font size is not rem/px', () => {
    expect(lineBoxHeightHint('1em', '1.5')).toBeNull()
  })
})
