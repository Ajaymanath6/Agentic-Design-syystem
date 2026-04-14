/**
 * Defaults for `brandcolor-*` tokens — keep in sync with `:root` in index.css and
 * `theme.extend.colors` in tailwind.config.js (CSS variable form).
 *
 * Non-color `theme.extend` values (read-only on Theme configuration page). Update when
 * tailwind.config.js changes.
 */
export const BRAND_COLOR_DEFAULTS = {
  // @agentic-brand-colors-start
  'brandcolor-primary': '#F84416',
  'brandcolor-primaryhover': '#EA4C00',
  'brandcolor-secondary': '#0A0A0A',
  'brandcolor-secondaryhover': '#292929',
  'brandcolor-secondaryfill': '#EAEFFF',
  'brandcolor-neutralhover': '#EFEFEF',
  'brandcolor-textstrong': '#1A1A1A',
  'brandcolor-textweak': '#575757',
  'brandcolor-strokestrong': '#575757',
  'brandcolor-strokeweak': '#E5E5E5',
  'brandcolor-strokemild': '#767676',
  'brandcolor-strokelight': '#F5F5F5',
  'brandcolor-fill': '#F5F5F5',
  'brandcolor-white': '#FFFFFF',
  'brandcolor-sidebarhover': '#2E3C48',
  'brandcolor-divider': '#404B53',
  'brandcolor-banner-info-bg': '#D5DFFF',
  'brandcolor-banner-warning-bg': '#FFEBE1',
  'brandcolor-banner-warning-button': '#F26333',
  'brandcolor-results-bg': '#F8F9FB',
  'brandcolor-archived-bg': '#FBF8E7',
  'brandcolor-archived-border': '#A5A5A5',
  'brandcolor-archived-badge': '#E8E8E8',
  'brandcolor-destructive': '#C20205',
  'brandcolor-table-header': '#DDDDDD',
  'brandcolor-badge-success-bg': '#E2F3E0',
  'brandcolor-badge-success-text': '#028831',
  'brandcolor-badge-attorney-bg': '#F2EBFF',
  'brandcolor-badge-attorney-text': '#6238AA',
  'brandcolor-badge-amber-bg': '#FFF7DB',
  'brandcolor-badge-amber-text': '#A47800',
  // @agentic-brand-colors-end
} as const

export type BrandColorKey = keyof typeof BRAND_COLOR_DEFAULTS

export const BRAND_COLOR_KEYS = Object.keys(
  BRAND_COLOR_DEFAULTS,
) as BrandColorKey[]

/** CSS custom property name (Tailwind maps each key to `rgb(var(--color-KEY) / …)`). */
export function cssVarNameForBrandColor(key: BrandColorKey): string {
  return `--color-${key}`
}

export const THEME_REFERENCE_READ_ONLY = {
  screens: {
    c_md: '768px',
    c_xl: '1280px',
  },
  fontFamily: {
    sans: ['var(--font-sans-stack)'],
    lora: ['var(--font-lora-stack)'],
  },
  fontSize: {
    'theme-title-h1': 'var(--fs-theme-title-h1) / var(--lh-theme-title-h1)',
    'theme-title-h2': 'var(--fs-theme-title-h2) / var(--lh-theme-title-h2)',
    'theme-title-h3': 'var(--fs-theme-title-h3) / var(--lh-theme-title-h3)',
    'theme-title-h4': 'var(--fs-theme-title-h4) / var(--lh-theme-title-h4)',
    'theme-title-h5': 'var(--fs-theme-title-h5) / var(--lh-theme-title-h5)',
    'theme-title-h6': 'var(--fs-theme-title-h6) / var(--lh-theme-title-h6)',
    'theme-body-large-regular':
      'var(--fs-theme-body-large-regular) / var(--lh-theme-body-large-regular)',
    'theme-body-large-emphasis':
      'var(--fs-theme-body-large-emphasis) / var(--lh-theme-body-large-emphasis)',
    'theme-body-large-bold':
      'var(--fs-theme-body-large-bold) / var(--lh-theme-body-large-bold)',
    'theme-body-medium-regular':
      'var(--fs-theme-body-medium-regular) / var(--lh-theme-body-medium-regular)',
    'theme-body-medium-emphasis':
      'var(--fs-theme-body-medium-emphasis) / var(--lh-theme-body-medium-emphasis)',
    'theme-body-medium-bold':
      'var(--fs-theme-body-medium-bold) / var(--lh-theme-body-medium-bold)',
    'theme-body-small-regular':
      'var(--fs-theme-body-small-regular) / var(--lh-theme-body-small-regular)',
    'theme-body-small-emphasis':
      'var(--fs-theme-body-small-emphasis) / var(--lh-theme-body-small-emphasis)',
    'theme-body-small-bold':
      'var(--fs-theme-body-small-bold) / var(--lh-theme-body-small-bold)',
  },
  lineHeight: {
    'theme-title-h1': 'var(--lh-theme-title-h1)',
    'theme-title-h2': 'var(--lh-theme-title-h2)',
    'theme-title-h3': 'var(--lh-theme-title-h3)',
    'theme-title-h4': 'var(--lh-theme-title-h4)',
    'theme-title-h5': 'var(--lh-theme-title-h5)',
    'theme-title-h6': 'var(--lh-theme-title-h6)',
    'theme-body-large-regular': 'var(--lh-theme-body-large-regular)',
    'theme-body-large-emphasis': 'var(--lh-theme-body-large-emphasis)',
    'theme-body-large-bold': 'var(--lh-theme-body-large-bold)',
    'theme-body-medium-regular': 'var(--lh-theme-body-medium-regular)',
    'theme-body-medium-emphasis': 'var(--lh-theme-body-medium-emphasis)',
    'theme-body-medium-bold': 'var(--lh-theme-body-medium-bold)',
    'theme-body-small-regular': 'var(--lh-theme-body-small-regular)',
    'theme-body-small-emphasis': 'var(--lh-theme-body-small-emphasis)',
    'theme-body-small-bold': 'var(--lh-theme-body-small-bold)',
  },
  fontWeight: {
    'theme-regular': 'var(--fw-theme-regular)',
    'theme-medium': 'var(--fw-theme-medium)',
    'theme-semibold': 'var(--fw-theme-semibold)',
    'theme-bold': 'var(--fw-theme-bold)',
  },
  boxShadow: {
    'button-press': 'var(--shadow-button-press)',
    'border-inset-strokelight': 'var(--shadow-border-inset-strokelight)',
    'border-inset-secondary': 'var(--shadow-border-inset-secondary)',
    'border-inset-secondary-press': 'var(--shadow-border-inset-secondary-press)',
    header: 'var(--shadow-header)',
    'tab-option': 'var(--shadow-tab-option)',
    card: 'var(--shadow-card)',
    'sidebar-toggle': 'var(--shadow-sidebar-toggle)',
    'confirm-password-valid': 'var(--shadow-confirm-password-valid)',
    'button-brand-glow': 'var(--shadow-button-brand-glow)',
  },
  borderWidth: {
    1.5: '1.5px',
  },
  borderRadius: {
    button: '6px',
    large: '12px',
  },
} as const
