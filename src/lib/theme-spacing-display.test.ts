import { describe, expect, it } from 'vitest'

import type { SpacingTokenKey } from '../config/theme-spacing-defaults'
import { SPACING_KEYS } from '../config/theme-spacing-defaults'
import {
  approxSpacingDisplayLabel,
  exampleTailwindForToken,
  spacingUseWhenLine,
} from './theme-spacing-display'

describe('approxSpacingDisplayLabel', () => {
  it('maps rem using 16px root', () => {
    expect(approxSpacingDisplayLabel('0.25rem')).toBe('≈ 4px @ 16px root')
    expect(approxSpacingDisplayLabel('1rem')).toBe('≈ 16px @ 16px root')
    expect(approxSpacingDisplayLabel('1.5rem')).toBe('≈ 24px @ 16px root')
    expect(approxSpacingDisplayLabel('2rem')).toBe('≈ 32px @ 16px root')
  })
  it('shows px values as fixed', () => {
    expect(approxSpacingDisplayLabel('8px')).toBe('8px (fixed)')
    expect(approxSpacingDisplayLabel('12px')).toBe('12px (fixed)')
  })
  it('returns null for invalid', () => {
    expect(approxSpacingDisplayLabel('1em')).toBeNull()
    expect(approxSpacingDisplayLabel('calc(1rem + 1px)')).toBeNull()
    expect(approxSpacingDisplayLabel('')).toBeNull()
  })
})

describe('exampleTailwindForToken', () => {
  it('returns a non-empty string for every spacing key', () => {
    for (const k of SPACING_KEYS) {
      expect(exampleTailwindForToken(k as SpacingTokenKey).length).toBeGreaterThan(
        0,
      )
    }
  })
})

describe('spacingUseWhenLine', () => {
  it('returns a line for every spacing key', () => {
    for (const k of SPACING_KEYS) {
      expect(spacingUseWhenLine(k as SpacingTokenKey).length).toBeGreaterThan(10)
    }
  })
})
