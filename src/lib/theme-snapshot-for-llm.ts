import {
  BRAND_COLOR_KEYS,
  type BrandColorKey,
} from '../config/brand-theme-colors'
import { loadThemeColorOverridesHex } from './theme-color-overrides'

/** Optional hex overrides for LLM palette block (Theme editor localStorage). */
export type ThemeSnapshotForLlm = {
  colors: Partial<Record<BrandColorKey, string>>
}

/** Merged file defaults + browser overrides for POST /canvas/* and /layout/*. */
export function buildThemeSnapshotForLlm(): ThemeSnapshotForLlm | undefined {
  const over = loadThemeColorOverridesHex()
  const colors: Partial<Record<BrandColorKey, string>> = {}
  for (const key of BRAND_COLOR_KEYS) {
    const hex = over[key]
    if (hex) colors[key] = hex
  }
  return Object.keys(colors).length > 0 ? { colors } : undefined
}
