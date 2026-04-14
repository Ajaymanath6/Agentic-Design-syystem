import {
  BRAND_COLOR_KEYS,
  type BrandColorKey,
} from '../../../config/brand-theme-colors'

export type ThemeColorGroup = {
  id: string
  title: string
  description?: string
  keys: readonly BrandColorKey[]
}

/**
 * Theme > Colors panel sections. Every key in {@link BRAND_COLOR_KEYS} must appear exactly once.
 */
export const THEME_COLOR_GROUPS: ThemeColorGroup[] = [
  {
    id: 'text',
    title: 'Text colors',
    description: 'Primary and supporting text on surfaces.',
    keys: ['brandcolor-textstrong', 'brandcolor-textweak'],
  },
  {
    id: 'stroke',
    title: 'Stroke colors',
    description: 'Dividers, icons, and borders.',
    keys: [
      'brandcolor-strokestrong',
      'brandcolor-strokeweak',
      'brandcolor-strokemild',
      'brandcolor-strokelight',
      'brandcolor-divider',
    ],
  },
  {
    id: 'brand',
    title: 'Brand',
    description: 'Primary and secondary brand fills and hovers.',
    keys: [
      'brandcolor-primary',
      'brandcolor-primaryhover',
      'brandcolor-secondary',
      'brandcolor-secondaryhover',
      'brandcolor-secondaryfill',
      'brandcolor-neutralhover',
    ],
  },
  {
    id: 'surfaces',
    title: 'Surfaces & chrome',
    description: 'Page backgrounds, cards, tables, and sidebar hover.',
    keys: [
      'brandcolor-fill',
      'brandcolor-white',
      'brandcolor-results-bg',
      'brandcolor-sidebarhover',
      'brandcolor-table-header',
    ],
  },
  {
    id: 'banners',
    title: 'Banners',
    keys: [
      'brandcolor-banner-info-bg',
      'brandcolor-banner-warning-bg',
      'brandcolor-banner-warning-button',
    ],
  },
  {
    id: 'archived',
    title: 'Archived',
    keys: [
      'brandcolor-archived-bg',
      'brandcolor-archived-border',
      'brandcolor-archived-badge',
    ],
  },
  {
    id: 'status',
    title: 'Status',
    keys: ['brandcolor-destructive'],
  },
  {
    id: 'badges',
    title: 'Badges',
    keys: [
      'brandcolor-badge-success-bg',
      'brandcolor-badge-success-text',
      'brandcolor-badge-attorney-bg',
      'brandcolor-badge-attorney-text',
      'brandcolor-badge-amber-bg',
      'brandcolor-badge-amber-text',
    ],
  },
] as const

const grouped = new Set<BrandColorKey>(
  THEME_COLOR_GROUPS.flatMap((g) => [...g.keys]),
)

for (const k of BRAND_COLOR_KEYS) {
  if (!grouped.has(k)) {
    throw new Error(
      `brand-color-theme-groups: add "${k}" to THEME_COLOR_GROUPS (missing from all groups).`,
    )
  }
}

for (const k of grouped) {
  if (!BRAND_COLOR_KEYS.includes(k)) {
    throw new Error(
      `brand-color-theme-groups: unknown key "${k}" in THEME_COLOR_GROUPS.`,
    )
  }
}
