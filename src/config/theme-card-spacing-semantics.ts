/**
 * Card-oriented semantic spacing: aliases only — lengths always flow through
 * `--space-*` primitives ([theme-spacing-defaults.ts](theme-spacing-defaults.ts)).
 * CSS `:root` and tailwind.config.js spacing keys must stay aligned with these maps.
 */
import type { SpacingTokenKey } from './theme-spacing-defaults'

/** Card shell padding tiers (conceptual “card.padding.*”). */
export type CardPaddingSemanticKey = 'compact' | 'default' | 'comfy'

export const CARD_PADDING_SEMANTIC: Record<
  CardPaddingSemanticKey,
  SpacingTokenKey
> = {
  compact: 'inline',
  default: 'cozy',
  comfy: 'section',
}

/** Maps to `--card-padding-{key}` on `:root`. */
export const CARD_PADDING_CSS_VAR: Record<CardPaddingSemanticKey, string> = {
  compact: '--card-padding-compact',
  default: '--card-padding-default',
  comfy: '--card-padding-comfy',
}

/** Tailwind `theme.extend.spacing` keys → same vars as CSS. */
export const CARD_PADDING_TAILWIND_KEY: Record<
  CardPaddingSemanticKey,
  string
> = {
  compact: 'card-pad-compact',
  default: 'card-pad-default',
  comfy: 'card-pad-comfy',
}

export const CARD_PADDING_SEMANTIC_KEYS = Object.keys(
  CARD_PADDING_SEMANTIC,
) as CardPaddingSemanticKey[]

/** Inner stack / action row gaps inside a card (conceptual “card.gap.*”). */
export type CardGapSemanticKey = 'tight' | 'default' | 'loose'

export const CARD_GAP_SEMANTIC: Record<CardGapSemanticKey, SpacingTokenKey> = {
  tight: 'tight',
  default: 'inline',
  loose: 'cozy',
}

export const CARD_GAP_CSS_VAR: Record<CardGapSemanticKey, string> = {
  tight: '--card-gap-tight',
  default: '--card-gap-default',
  loose: '--card-gap-loose',
}

export const CARD_GAP_TAILWIND_KEY: Record<CardGapSemanticKey, string> = {
  tight: 'card-gap-tight',
  default: 'card-gap-default',
  loose: 'card-gap-loose',
}

export const CARD_GAP_SEMANTIC_KEYS = Object.keys(
  CARD_GAP_SEMANTIC,
) as CardGapSemanticKey[]
