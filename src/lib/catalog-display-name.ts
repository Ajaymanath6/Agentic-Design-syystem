import type { CatalogCardModel } from '../types/catalog'

/** Match catalog ids that end with a UUID (node id from canvas / publish). */
const TRAILING_UUID =
  /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const CANVAS_PREFIX_LABEL: Record<string, string> = {
  'canvas-card': 'Canvas card',
  'canvas-primary': 'Primary button',
  'canvas-secondary': 'Secondary button',
  'canvas-neutral': 'Neutral button',
  'canvas-confirm-password': 'Confirm password',
  'canvas-text-field': 'Text field',
  'canvas-product-sidebar': 'Product sidebar',
}

/**
 * Turn a catalog `entry.id` (kebab-case, often `prefix-…-uuid`) into a short UI title
 * without trailing UUID or PascalCase importId noise.
 */
export function humanizeCatalogEntryId(id: string): string {
  const trimmed = id.trim()
  if (!trimmed) return 'Component'
  const base = trimmed.replace(TRAILING_UUID, '')
  const mapped = CANVAS_PREFIX_LABEL[base]
  if (mapped) return mapped
  return base
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Human-readable name for catalog tiles and modals.
 * Prefer blueprint `data.imageAlt` (publish label). Never use `importId` for display —
 * it embeds UUIDs (e.g. CanvasConfirmPassword9471e5c9…).
 */
export function catalogCardDisplayName(card: CatalogCardModel): string {
  const alt = card.blueprint?.data?.imageAlt
  if (typeof alt === 'string' && alt.trim().length > 0) {
    return alt.trim()
  }
  return humanizeCatalogEntryId(card.entry.id)
}
