import { describe, expect, it } from 'vitest'
import { getOpenLayoutCatalogMentionAtCursor } from './layout-prompt-mentions'

describe('getOpenLayoutCatalogMentionAtCursor', () => {
  it('returns filter after @ until space or newline', () => {
    expect(getOpenLayoutCatalogMentionAtCursor('hello @foo', 10)).toEqual({
      start: 6,
      filter: 'foo',
    })
  })

  it('returns null after space closes mention', () => {
    expect(getOpenLayoutCatalogMentionAtCursor('hello @foo bar', 14)).toBeNull()
  })

  it('returns null when @ line has newline in the mention suffix', () => {
    expect(getOpenLayoutCatalogMentionAtCursor('hello @\n', 8)).toBeNull()
  })
})
