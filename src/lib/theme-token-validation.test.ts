import { describe, expect, it } from 'vitest'
import { SHADOW_DEFAULTS, SHADOW_KEYS } from '../config/theme-shadow-defaults'
import {
  TYPOGRAPHY_DEFAULTS,
  TYPOGRAPHY_KEYS,
} from '../config/theme-typography-defaults'
import {
  mergeShadowPayload,
  mergeTypographyPayload,
  validateShadowValue,
  validateTypographyValue,
} from './theme-token-validation'

describe('validateShadowValue', () => {
  it('accepts a simple inset shadow', () => {
    expect(validateShadowValue('inset 0 0 0 1px #000')).toBe('inset 0 0 0 1px #000')
  })
  it('rejects url()', () => {
    expect(validateShadowValue('0 0 0 url(x)')).toBeNull()
  })
  it('rejects angle brackets', () => {
    expect(validateShadowValue('0 0 0 <script>')).toBeNull()
  })
  it('rejects overly long strings', () => {
    expect(validateShadowValue('a'.repeat(900))).toBeNull()
  })
})

describe('validateTypographyValue', () => {
  it('accepts rem and px font sizes', () => {
    expect(
      validateTypographyValue('fs-theme-body-medium-regular', '0.875rem'),
    ).toBe('0.875rem')
    expect(validateTypographyValue('fs-theme-body-medium-regular', '14px')).toBe(
      '14px',
    )
  })
  it('rejects invalid font sizes', () => {
    expect(validateTypographyValue('fs-theme-body-medium-regular', '1em')).toBeNull()
  })
  it('accepts line height numbers', () => {
    expect(
      validateTypographyValue('lh-theme-body-medium-regular', '1.625'),
    ).toBe('1.625')
  })
  it('accepts font weights', () => {
    expect(validateTypographyValue('fw-theme-semibold', '600')).toBe('600')
  })
  it('accepts font stacks without unsafe patterns', () => {
    expect(
      validateTypographyValue(
        'font-sans-stack',
        "'IBM Plex Sans', sans-serif",
      ),
    ).toBe("'IBM Plex Sans', sans-serif")
  })
})

describe('mergeShadowPayload', () => {
  it('returns a full map when all keys valid', () => {
    const input: Record<string, string> = { ...SHADOW_DEFAULTS }
    const m = mergeShadowPayload(input, SHADOW_KEYS)
    expect(m).not.toBeNull()
    expect(m!.card).toBe(SHADOW_DEFAULTS.card)
  })
  it('returns null when a key is missing', () => {
    expect(mergeShadowPayload({ card: '0 0 1px #000' }, SHADOW_KEYS)).toBeNull()
  })
})

describe('mergeTypographyPayload', () => {
  it('returns null when invalid', () => {
    expect(
      mergeTypographyPayload(
        { 'font-sans-stack': 'url(x)' } as Record<string, unknown>,
        TYPOGRAPHY_KEYS,
      ),
    ).toBeNull()
  })
  it('returns a full map when all keys valid', () => {
    const input: Record<string, string> = { ...TYPOGRAPHY_DEFAULTS }
    const m = mergeTypographyPayload(input, TYPOGRAPHY_KEYS)
    expect(m).not.toBeNull()
    expect(m!['fw-theme-bold']).toBe('700')
  })
})
