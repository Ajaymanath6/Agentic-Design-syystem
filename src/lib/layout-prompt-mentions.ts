/**
 * Layout prompt composer: detect open `@` mention in a plain textarea (no `canvas:` prefix).
 * Closes when the user types a space or newline after `@`.
 */
export function getOpenLayoutCatalogMentionAtCursor(
  value: string,
  cursor: number,
): { start: number; filter: string } | null {
  const before = value.slice(0, cursor)
  const at = before.lastIndexOf('@')
  if (at === -1) return null
  const afterAt = before.slice(at + 1)
  if (afterAt.includes('\n') || afterAt.includes(' ')) return null
  return { start: at, filter: afterAt }
}

export const MAX_LAYOUT_CATALOG_REFERENCE_BLOCKS = 12
