import { describe, expect, it } from 'vitest'

import { SPACING_KEYS } from '../../../config/theme-spacing-defaults'
import type { SpacingTokenKey } from '../../../config/theme-spacing-defaults'
import { TOKEN_SPACING_HELP } from './token-spacing-help'

describe('TOKEN_SPACING_HELP', () => {
  it('has an entry for every SpacingTokenKey', () => {
    for (const k of SPACING_KEYS) {
      const entry = TOKEN_SPACING_HELP[k as SpacingTokenKey]
      expect(entry, `missing help for ${k}`).toBeDefined()
      expect(entry!.title.length).toBeGreaterThan(0)
      expect(entry!.body).toBeDefined()
    }
  })
})
