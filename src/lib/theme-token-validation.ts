import type { ShadowTokenKey } from '../config/theme-shadow-defaults'
import type { SpacingTokenKey } from '../config/theme-spacing-defaults'
import type { TypographyTokenKey } from '../config/theme-typography-defaults'

export const SHADOW_VALUE_MAX_LEN = 800

/** Spacing tokens: rem or px only (same rule as typography font sizes). */
export const SPACING_VALUE_MAX_LEN = 32

const FS_RE = /^\d+(\.\d+)?(rem|px)$/i
const LH_RE = /^\d+(\.\d+)?$/
const FW_RE = /^(100|200|300|400|500|600|700|800|900)$/

export function validateShadowValue(raw: string): string | null {
  const s = raw.trim()
  if (s.length === 0 || s.length > SHADOW_VALUE_MAX_LEN) return null
  const low = s.toLowerCase()
  if (
    low.includes('url(') ||
    low.includes('expression(') ||
    low.includes('<') ||
    low.includes('javascript:')
  ) {
    return null
  }
  return s
}

export function validateTypographyValue(
  key: TypographyTokenKey,
  raw: string,
): string | null {
  const s = raw.trim()
  if (s.length === 0) return null
  if (key === 'font-sans-stack' || key === 'font-lora-stack') {
    if (s.length > 400) return null
    const low = s.toLowerCase()
    if (
      low.includes('url(') ||
      low.includes('expression(') ||
      low.includes('<') ||
      low.includes('javascript:')
    ) {
      return null
    }
    return s
  }
  if (key.startsWith('fs-theme-')) {
    return FS_RE.test(s) ? s : null
  }
  if (key.startsWith('lh-theme-')) {
    return LH_RE.test(s) ? s : null
  }
  if (key.startsWith('fw-theme-')) {
    return FW_RE.test(s) ? s : null
  }
  return null
}

export function validateSpacingValue(raw: string): string | null {
  const s = raw.trim()
  if (s.length === 0 || s.length > SPACING_VALUE_MAX_LEN) return null
  return FS_RE.test(s) ? s : null
}

export function mergeShadowPayload(
  input: Record<string, unknown>,
  keys: readonly ShadowTokenKey[],
): Partial<Record<ShadowTokenKey, string>> | null {
  const out: Partial<Record<ShadowTokenKey, string>> = {}
  for (const k of keys) {
    const v = input[k]
    if (typeof v !== 'string') return null
    const ok = validateShadowValue(v)
    if (!ok) return null
    out[k] = ok
  }
  return out
}

export function mergeTypographyPayload(
  input: Record<string, unknown>,
  keys: readonly TypographyTokenKey[],
): Partial<Record<TypographyTokenKey, string>> | null {
  const out: Partial<Record<TypographyTokenKey, string>> = {}
  for (const k of keys) {
    const v = input[k]
    if (typeof v !== 'string') return null
    const ok = validateTypographyValue(k, v)
    if (!ok) return null
    out[k] = ok
  }
  return out
}

export function mergeSpacingPayload(
  input: Record<string, unknown>,
  keys: readonly SpacingTokenKey[],
): Partial<Record<SpacingTokenKey, string>> | null {
  const out: Partial<Record<SpacingTokenKey, string>> = {}
  for (const k of keys) {
    const v = input[k]
    if (typeof v !== 'string') return null
    const ok = validateSpacingValue(v)
    if (!ok) return null
    out[k] = ok
  }
  return out
}
