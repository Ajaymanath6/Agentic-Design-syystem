/**
 * Typography tokens on `:root`. Disk sync replaces the marked region here and in
 * `src/index.css`. Tailwind semantic utilities use these CSS variables.
 */
export const TYPOGRAPHY_DEFAULTS = {
  // @agentic-theme-typography-defaults-start
  'font-sans-stack': "'IBM Plex Sans', sans-serif",
  'font-lora-stack': "'Lora', serif",
  'fs-theme-title-h1': '2.25rem',
  'lh-theme-title-h1': '1.2',
  'fs-theme-title-h2': '1.875rem',
  'lh-theme-title-h2': '1.25',
  'fs-theme-title-h3': '1.5rem',
  'lh-theme-title-h3': '1.3',
  'fs-theme-title-h4': '1.25rem',
  'lh-theme-title-h4': '1.35',
  'fs-theme-title-h5': '1.125rem',
  'lh-theme-title-h5': '1.4',
  'fs-theme-title-h6': '1rem',
  'lh-theme-title-h6': '1.4',
  'fs-theme-body-large-regular': '1.125rem',
  'lh-theme-body-large-regular': '1.4',
  'fs-theme-body-large-emphasis': '1.125rem',
  'lh-theme-body-large-emphasis': '1.4',
  'fs-theme-body-large-bold': '1.125rem',
  'lh-theme-body-large-bold': '1.4',
  'fs-theme-body-medium-regular': '1rem',
  'lh-theme-body-medium-regular': '1.4',
  'fs-theme-body-medium-emphasis': '1rem',
  'lh-theme-body-medium-emphasis': '1.4',
  'fs-theme-body-medium-bold': '1rem',
  'lh-theme-body-medium-bold': '1.4',
  'fs-theme-body-small-regular': '0.875rem',
  'lh-theme-body-small-regular': '1.4',
  'fs-theme-body-small-emphasis': '0.875rem',
  'lh-theme-body-small-emphasis': '1.4',
  'fs-theme-body-small-bold': '0.875rem',
  'lh-theme-body-small-bold': '1.4',
  'fw-theme-regular': '400',
  'fw-theme-medium': '500',
  'fw-theme-semibold': '600',
  'fw-theme-bold': '700',
  // @agentic-theme-typography-defaults-end
} as const

export type TypographyTokenKey = keyof typeof TYPOGRAPHY_DEFAULTS

export const TYPOGRAPHY_KEYS = Object.keys(
  TYPOGRAPHY_DEFAULTS,
) as TypographyTokenKey[]

export function cssVarNameForTypography(key: TypographyTokenKey): string {
  return `--${key}`
}

/** Title levels H1–H6 (fs/lh token suffix). */
export const THEME_TITLE_LEVELS = [1, 2, 3, 4, 5, 6] as const

/** Body text-style sizes under Text Styles. */
export const THEME_BODY_SIZES = ['large', 'medium', 'small'] as const

export type ThemeBodySize = (typeof THEME_BODY_SIZES)[number]

/** Sub-variants per size (Regular ≈ 400, Emphasis ≈ 600, Bold ≈ 700 in app). */
export const THEME_BODY_VARIANTS = ['regular', 'emphasis', 'bold'] as const

export type ThemeBodyVariant = (typeof THEME_BODY_VARIANTS)[number]

export function typographyFsKeyTitle(level: number): TypographyTokenKey {
  return `fs-theme-title-h${level}` as TypographyTokenKey
}

export function typographyLhKeyTitle(level: number): TypographyTokenKey {
  return `lh-theme-title-h${level}` as TypographyTokenKey
}

export function typographyFsKeyBody(
  size: ThemeBodySize,
  variant: ThemeBodyVariant,
): TypographyTokenKey {
  return `fs-theme-body-${size}-${variant}` as TypographyTokenKey
}

export function typographyLhKeyBody(
  size: ThemeBodySize,
  variant: ThemeBodyVariant,
): TypographyTokenKey {
  return `lh-theme-body-${size}-${variant}` as TypographyTokenKey
}
