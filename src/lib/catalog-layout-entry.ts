import type { CatalogComponentEntry } from '../types/catalog'

/**
 * True for rows from Admin → Layout → Publish. Uses `kind` when set; also
 * matches ids `layout-<hash>` so older catalog rows without `kind` still sort
 * under UI pages, not UI components.
 */
export function isCatalogLayoutEntry(entry: CatalogComponentEntry): boolean {
  if (entry.kind === 'layout') return true
  return entry.id.startsWith('layout-')
}
