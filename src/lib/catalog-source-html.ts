import type { CatalogCardModel } from '../types/catalog'

/** Non-empty `sourceHtml` from a loaded blueprint, if any. */
export function catalogCardSourceHtml(card: CatalogCardModel): string {
  const raw = card.blueprint?.data?.sourceHtml
  return typeof raw === 'string' ? raw : ''
}
