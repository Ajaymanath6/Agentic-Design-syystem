/** @vitest-environment jsdom */

import { describe, expect, it, beforeEach } from 'vitest'

import { BRAND_COLOR_DEFAULTS, type BrandColorKey } from '../config/brand-theme-colors'
import {
  THEME_COLOR_OVERRIDES_STORAGE_KEY,
  applyBrandColorsFromHexMap,
  clearThemeColorOverrides,
  loadThemeColorOverridesHex,
  saveThemeColorOverridesHex,
} from './theme-color-overrides'

describe('theme-color-overrides', () => {
  beforeEach(() => {
    localStorage.removeItem(THEME_COLOR_OVERRIDES_STORAGE_KEY)
    document.documentElement.removeAttribute('style')
  })

  it('persists and loads hex overrides', () => {
    saveThemeColorOverridesHex({
      'brandcolor-primary': '#112233',
    } as Partial<Record<BrandColorKey, string>>)
    const loaded = loadThemeColorOverridesHex()
    expect(loaded['brandcolor-primary']).toBe('#112233')
  })

  it('applyBrandColorsFromHexMap sets CSS variables on documentElement', () => {
    applyBrandColorsFromHexMap({
      'brandcolor-primary': '#AABBCC',
    })
    const v = document.documentElement.style.getPropertyValue(
      '--color-brandcolor-primary',
    )
    expect(v.trim()).toBe('170 187 204')
  })

  it('clearThemeColorOverrides removes storage', () => {
    saveThemeColorOverridesHex({
      'brandcolor-primary': '#112233',
    } as Partial<Record<BrandColorKey, string>>)
    clearThemeColorOverrides()
    expect(localStorage.getItem(THEME_COLOR_OVERRIDES_STORAGE_KEY)).toBeNull()
  })

  it('falls back to defaults for unspecified keys when applying partial map', () => {
    applyBrandColorsFromHexMap({})
    const primary = document.documentElement.style.getPropertyValue(
      '--color-brandcolor-primary',
    )
    const def = BRAND_COLOR_DEFAULTS['brandcolor-primary']
    const r = Number.parseInt(def.slice(1, 3), 16)
    const g = Number.parseInt(def.slice(3, 5), 16)
    const b = Number.parseInt(def.slice(5, 7), 16)
    expect(primary.trim()).toBe(`${r} ${g} ${b}`)
  })
})
