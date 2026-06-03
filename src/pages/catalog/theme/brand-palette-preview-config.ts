import type { BrandColorKey } from '../../../config/brand-theme-colors'

export type BrandPalettePreviewToken = BrandColorKey

/** Swatches shown below Brand colors — order and keys are fixed; hex comes from theme state. */
export const BRAND_PALETTE_PREVIEW_KEYS: readonly BrandPalettePreviewToken[] = [
  'brandcolor-primary',
  'brandcolor-textstrong',
  'brandcolor-textweak',
  'brandcolor-strokestrong',
  'brandcolor-strokeweak',
  'brandcolor-fill',
  'brandcolor-white',
] as const
