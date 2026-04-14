import {
  BRAND_COLOR_DEFAULTS,
  BRAND_COLOR_KEYS,
  type BrandColorKey,
  cssVarNameForBrandColor,
} from '../config/brand-theme-colors'

export const THEME_COLOR_OVERRIDES_STORAGE_KEY =
  'agentic-theme-color-overrides-v1'

function hexToRgbChannels(hex: string): string | null {
  const raw = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  if ([r, g, b].some((n) => Number.isNaN(n))) return null
  return `${r} ${g} ${b}`
}

function defaultRgbChannels(key: BrandColorKey): string {
  const hex = BRAND_COLOR_DEFAULTS[key]
  return hexToRgbChannels(hex) ?? '0 0 0'
}

/** Apply RGB triples (space-separated) to :root for every brand color key. */
export function applyBrandColorRgbToDocument(
  rgbByKey: Partial<Record<BrandColorKey, string>>,
): void {
  const root = document.documentElement
  for (const key of BRAND_COLOR_KEYS) {
    const triple = rgbByKey[key] ?? defaultRgbChannels(key)
    root.style.setProperty(cssVarNameForBrandColor(key), triple)
  }
}

function normalizeHex6(hex: string): string | null {
  const raw = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null
  return `#${raw.toUpperCase()}`
}

export function saveThemeColorOverridesHex(
  hexByKey: Partial<Record<BrandColorKey, string>>,
): void {
  const toStore: Record<string, string> = {}
  for (const key of BRAND_COLOR_KEYS) {
    const hex = hexByKey[key]
    const norm = hex ? normalizeHex6(hex) : null
    if (norm) toStore[key] = norm
  }
  if (Object.keys(toStore).length === 0) {
    localStorage.removeItem(THEME_COLOR_OVERRIDES_STORAGE_KEY)
    return
  }
  localStorage.setItem(
    THEME_COLOR_OVERRIDES_STORAGE_KEY,
    JSON.stringify(toStore),
  )
}

/** Hex map from storage (for editor prefill / export). */
export function loadThemeColorOverridesHex(): Partial<
  Record<BrandColorKey, string>
> {
  try {
    const raw = localStorage.getItem(THEME_COLOR_OVERRIDES_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed == null || typeof parsed !== 'object') return {}
    const out: Partial<Record<BrandColorKey, string>> = {}
    for (const key of BRAND_COLOR_KEYS) {
      const v = (parsed as Record<string, unknown>)[key]
      if (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/i.test(v.trim())) {
        const h = v.trim().startsWith('#') ? v.trim() : `#${v.trim()}`
        out[key] = h.toUpperCase()
      }
    }
    return out
  } catch {
    return {}
  }
}

export function clearThemeColorOverrides(): void {
  localStorage.removeItem(THEME_COLOR_OVERRIDES_STORAGE_KEY)
}

/** Merge saved hex overrides into RGB triples and apply to document. */
export function applyThemeColorOverridesFromStorage(): void {
  const hexPartial = loadThemeColorOverridesHex()
  const rgbByKey: Partial<Record<BrandColorKey, string>> = {}
  for (const key of BRAND_COLOR_KEYS) {
    const hex = hexPartial[key]
    if (hex) {
      const ch = hexToRgbChannels(hex)
      if (ch) rgbByKey[key] = ch
    }
  }
  applyBrandColorRgbToDocument(rgbByKey)
}

/** Apply every key from editor state (hex per key); missing entries use defaults. */
export function applyBrandColorsFromHexMap(
  hexByKey: Partial<Record<BrandColorKey, string>>,
): void {
  const rgbByKey: Partial<Record<BrandColorKey, string>> = {}
  for (const key of BRAND_COLOR_KEYS) {
    const raw = hexByKey[key] ?? BRAND_COLOR_DEFAULTS[key]
    const ch = hexToRgbChannels(raw)
    if (ch) rgbByKey[key] = ch
  }
  applyBrandColorRgbToDocument(rgbByKey)
}

/** Persist only keys that differ from built-in defaults. */
export function saveThemeColorOverridesDiffFromDefaults(
  hexByKey: Partial<Record<BrandColorKey, string>>,
): void {
  const toStore: Partial<Record<BrandColorKey, string>> = {}
  for (const key of BRAND_COLOR_KEYS) {
    const norm = normalizeHex6(hexByKey[key] ?? BRAND_COLOR_DEFAULTS[key])
    const def = normalizeHex6(BRAND_COLOR_DEFAULTS[key])
    if (norm && def && norm !== def) {
      toStore[key] = norm
    }
  }
  saveThemeColorOverridesHex(toStore)
}
