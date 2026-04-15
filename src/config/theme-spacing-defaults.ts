/**
 * Spacing tokens on `:root` as `--space-{key}`. Disk sync replaces the marked region here
 * and in `src/index.css`. Tailwind `theme.extend.spacing` maps keys to `var(--space-*)`.
 */
export const SPACING_DEFAULTS = {
  // @agentic-theme-spacing-defaults-start
  micro: '0.25rem',
  tight: '0.5rem',
  cozy: '1rem',
  section: '1.5rem',
  hero: '2rem',
  inline: '0.75rem',
  // @agentic-theme-spacing-defaults-end
} as const

export type SpacingTokenKey = keyof typeof SPACING_DEFAULTS

export const SPACING_KEYS = Object.keys(
  SPACING_DEFAULTS,
) as SpacingTokenKey[]

export function cssVarNameForSpacing(key: SpacingTokenKey): string {
  return `--space-${key}`
}
