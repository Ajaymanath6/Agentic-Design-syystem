/**
 * Box-shadow tokens → `--shadow-{key}` on `:root`. Disk sync replaces the marked
 * region here and in `src/index.css`. Tailwind `boxShadow` uses `var(--shadow-*)`.
 */
export const SHADOW_DEFAULTS = {
  // @agentic-theme-shadow-defaults-start
  'button-press': 'inset 3px 3px 10px 0px rgba(26, 26, 26, 0.33)',
  'border-inset-strokelight': 'inset 0 0 0 1.5px #F5F5F5',
  'border-inset-secondary': 'inset 0 0 0 1.5px #0A0A0A',
  'border-inset-secondary-press':
    'inset 0 0 0 1.5px #0A0A0A, inset 3px 3px 10px 0px rgba(26, 26, 26, 0.33)',
  header: '0px 4px 4px 0px rgba(87, 87, 87, 0.05)',
  'tab-option': '0 1px 5px 0 rgba(0, 0, 0, 0.2)',
  card: '0 0 5px 0 rgba(102, 118, 131, 0.2)',
  'sidebar-toggle': '0 1px 4px 0 rgba(0, 0, 0, 0.08)',
  /** Primary-linked — updates when `--color-brandcolor-primary` changes. */
  'confirm-password-valid':
    '0 0 0 2px rgb(var(--color-brandcolor-primary) / 0.28), 0 0 14px 6px rgb(var(--color-brandcolor-primary) / 0.18), 0 8px 28px rgb(var(--color-brandcolor-primary) / 0.22)',
  'button-brand-glow':
    '0 10px 36px -6px rgb(var(--color-brandcolor-primary) / 0.5), 0 6px 24px -4px rgb(var(--color-brandcolor-primary) / 0.38), 0 3px 14px -2px rgb(var(--color-brandcolor-primary) / 0.28)',
  // @agentic-theme-shadow-defaults-end
} as const

export type ShadowTokenKey = keyof typeof SHADOW_DEFAULTS

export const SHADOW_KEYS = Object.keys(SHADOW_DEFAULTS) as ShadowTokenKey[]

export function cssVarNameForShadow(key: ShadowTokenKey): string {
  return `--shadow-${key}`
}
