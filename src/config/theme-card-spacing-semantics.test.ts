import { describe, expect, it } from 'vitest'

import { SPACING_KEYS } from './theme-spacing-defaults'
import type { SpacingTokenKey } from './theme-spacing-defaults'
import {
  CARD_GAP_SEMANTIC,
  CARD_GAP_SEMANTIC_KEYS,
  CARD_PADDING_SEMANTIC,
  CARD_PADDING_SEMANTIC_KEYS,
} from './theme-card-spacing-semantics'

const spacingSet = new Set<string>(SPACING_KEYS)

function expectValidPrimitive(key: string, target: SpacingTokenKey) {
  expect(spacingSet.has(target), `${key} → ${target}`).toBe(true)
}

describe('theme-card-spacing-semantics', () => {
  it('card padding aliases point at SpacingTokenKey values', () => {
    for (const k of CARD_PADDING_SEMANTIC_KEYS) {
      expectValidPrimitive(`padding.${k}`, CARD_PADDING_SEMANTIC[k])
    }
  })

  it('card gap aliases point at SpacingTokenKey values', () => {
    for (const k of CARD_GAP_SEMANTIC_KEYS) {
      expectValidPrimitive(`gap.${k}`, CARD_GAP_SEMANTIC[k])
    }
  })

  it('has three padding and three gap semantics', () => {
    expect(CARD_PADDING_SEMANTIC_KEYS).toHaveLength(3)
    expect(CARD_GAP_SEMANTIC_KEYS).toHaveLength(3)
  })
})
