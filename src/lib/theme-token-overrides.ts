import {
  SHADOW_DEFAULTS,
  SHADOW_KEYS,
  type ShadowTokenKey,
  cssVarNameForShadow,
} from '../config/theme-shadow-defaults'
import {
  SPACING_DEFAULTS,
  SPACING_KEYS,
  type SpacingTokenKey,
  cssVarNameForSpacing,
} from '../config/theme-spacing-defaults'
import {
  TYPOGRAPHY_DEFAULTS,
  TYPOGRAPHY_KEYS,
  type TypographyTokenKey,
  cssVarNameForTypography,
} from '../config/theme-typography-defaults'
import {
  validateShadowValue,
  validateSpacingValue,
  validateTypographyValue,
} from './theme-token-validation'

export const THEME_SHADOW_OVERRIDES_STORAGE_KEY = 'agentic-theme-shadows-v1'
export const THEME_TYPOGRAPHY_OVERRIDES_STORAGE_KEY =
  'agentic-theme-typography-v1'
export const THEME_SPACING_OVERRIDES_STORAGE_KEY = 'agentic-theme-spacing-v1'

export function applyShadowValuesToDocument(
  byKey: Partial<Record<ShadowTokenKey, string>>,
): void {
  const root = document.documentElement
  for (const key of SHADOW_KEYS) {
    const v = byKey[key] ?? SHADOW_DEFAULTS[key]
    root.style.setProperty(cssVarNameForShadow(key), v)
  }
}

export function applyTypographyValuesToDocument(
  byKey: Partial<Record<TypographyTokenKey, string>>,
): void {
  const root = document.documentElement
  for (const key of TYPOGRAPHY_KEYS) {
    const v = byKey[key] ?? TYPOGRAPHY_DEFAULTS[key]
    root.style.setProperty(cssVarNameForTypography(key), v)
  }
}

export function applySpacingValuesToDocument(
  byKey: Partial<Record<SpacingTokenKey, string>>,
): void {
  const root = document.documentElement
  for (const key of SPACING_KEYS) {
    const v = byKey[key] ?? SPACING_DEFAULTS[key]
    root.style.setProperty(cssVarNameForSpacing(key), v)
  }
}

function loadJsonRecord(key: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed))
      return {}
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string' && v.trim()) out[k] = v.trim()
    }
    return out
  } catch {
    return {}
  }
}

export function loadThemeShadowOverrides(): Partial<
  Record<ShadowTokenKey, string>
> {
  const raw = loadJsonRecord(THEME_SHADOW_OVERRIDES_STORAGE_KEY)
  const out: Partial<Record<ShadowTokenKey, string>> = {}
  for (const key of SHADOW_KEYS) {
    const v = raw[key]
    if (typeof v === 'string') {
      const ok = validateShadowValue(v)
      if (ok) out[key] = ok
    }
  }
  return out
}

export function loadThemeTypographyOverrides(): Partial<
  Record<TypographyTokenKey, string>
> {
  const raw = loadJsonRecord(THEME_TYPOGRAPHY_OVERRIDES_STORAGE_KEY)
  const out: Partial<Record<TypographyTokenKey, string>> = {}
  for (const key of TYPOGRAPHY_KEYS) {
    const v = raw[key]
    if (typeof v === 'string') {
      const ok = validateTypographyValue(key, v)
      if (ok) out[key] = ok
    }
  }
  return out
}

export function loadThemeSpacingOverrides(): Partial<
  Record<SpacingTokenKey, string>
> {
  const raw = loadJsonRecord(THEME_SPACING_OVERRIDES_STORAGE_KEY)
  const out: Partial<Record<SpacingTokenKey, string>> = {}
  for (const key of SPACING_KEYS) {
    const v = raw[key]
    if (typeof v === 'string') {
      const ok = validateSpacingValue(v)
      if (ok) out[key] = ok
    }
  }
  return out
}

export function saveThemeShadowOverridesDiffFromDefaults(
  byKey: Partial<Record<ShadowTokenKey, string>>,
): void {
  const toStore: Record<string, string> = {}
  for (const key of SHADOW_KEYS) {
    const cur = (byKey[key] ?? SHADOW_DEFAULTS[key]).trim()
    const def = SHADOW_DEFAULTS[key]
    if (cur !== def) toStore[key] = cur
  }
  if (Object.keys(toStore).length === 0) {
    localStorage.removeItem(THEME_SHADOW_OVERRIDES_STORAGE_KEY)
    return
  }
  localStorage.setItem(
    THEME_SHADOW_OVERRIDES_STORAGE_KEY,
    JSON.stringify(toStore),
  )
}

export function saveThemeTypographyOverridesDiffFromDefaults(
  byKey: Partial<Record<TypographyTokenKey, string>>,
): void {
  const toStore: Record<string, string> = {}
  for (const key of TYPOGRAPHY_KEYS) {
    const cur = (byKey[key] ?? TYPOGRAPHY_DEFAULTS[key]).trim()
    const def = TYPOGRAPHY_DEFAULTS[key]
    if (cur !== def) toStore[key] = cur
  }
  if (Object.keys(toStore).length === 0) {
    localStorage.removeItem(THEME_TYPOGRAPHY_OVERRIDES_STORAGE_KEY)
    return
  }
  localStorage.setItem(
    THEME_TYPOGRAPHY_OVERRIDES_STORAGE_KEY,
    JSON.stringify(toStore),
  )
}

export function saveThemeSpacingOverridesDiffFromDefaults(
  byKey: Partial<Record<SpacingTokenKey, string>>,
): void {
  const toStore: Record<string, string> = {}
  for (const key of SPACING_KEYS) {
    const cur = (byKey[key] ?? SPACING_DEFAULTS[key]).trim()
    const def = SPACING_DEFAULTS[key]
    if (cur !== def) toStore[key] = cur
  }
  if (Object.keys(toStore).length === 0) {
    localStorage.removeItem(THEME_SPACING_OVERRIDES_STORAGE_KEY)
    return
  }
  localStorage.setItem(
    THEME_SPACING_OVERRIDES_STORAGE_KEY,
    JSON.stringify(toStore),
  )
}

export function clearThemeShadowOverrides(): void {
  localStorage.removeItem(THEME_SHADOW_OVERRIDES_STORAGE_KEY)
}

export function clearThemeTypographyOverrides(): void {
  localStorage.removeItem(THEME_TYPOGRAPHY_OVERRIDES_STORAGE_KEY)
}

export function clearThemeSpacingOverrides(): void {
  localStorage.removeItem(THEME_SPACING_OVERRIDES_STORAGE_KEY)
}

export function applyThemeShadowOverridesFromStorage(): void {
  applyShadowValuesToDocument(loadThemeShadowOverrides())
}

export function applyThemeTypographyOverridesFromStorage(): void {
  applyTypographyValuesToDocument(loadThemeTypographyOverrides())
}

export function applyThemeSpacingOverridesFromStorage(): void {
  applySpacingValuesToDocument(loadThemeSpacingOverrides())
}

export function applyThemeTokenOverridesFromStorage(): void {
  applyThemeShadowOverridesFromStorage()
  applyThemeTypographyOverridesFromStorage()
  applyThemeSpacingOverridesFromStorage()
}
