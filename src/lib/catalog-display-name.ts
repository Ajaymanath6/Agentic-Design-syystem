import type { CatalogCardModel } from '../types/catalog'

/**
 * Human-readable name for catalog tiles and modals.
 * Blueprint `data.imageAlt` is set from the publish `label` (e.g. sidebar title),
 * avoiding long generated `importId` strings like `CanvasProductSidebar…Component`.
 */
export function catalogCardDisplayName(card: CatalogCardModel): string {
  const alt = card.blueprint?.data?.imageAlt
  if (typeof alt === 'string' && alt.trim().length > 0) {
    return alt.trim()
  }
  const imp = card.entry.importId?.trim()
  if (imp) return imp
  return card.entry.id
}
