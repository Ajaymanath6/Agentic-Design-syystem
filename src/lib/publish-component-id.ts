/**
 * Must match `toKebabComponentId` in server/publish-helper.mjs so client catalog
 * lookups align with published rows.
 */
export function toKebabComponentId(raw: string): string {
  if (!raw || typeof raw !== 'string') return 'unnamed-component'
  let s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (!s) s = 'unnamed-component'
  return s
}

/** Catalog `entry.id` for a components-canvas card after publish. */
export function canvasCardCatalogId(nodeId: string): string {
  return toKebabComponentId(`canvas-card-${nodeId}`)
}

/** Catalog `entry.id` for a components-canvas primary button after publish. */
export function canvasPrimaryButtonCatalogId(nodeId: string): string {
  return toKebabComponentId(`canvas-primary-${nodeId}`)
}

/**
 * Matches `toImportId` in server/publish-helper.mjs (PascalCase segments + `Component`).
 */
export function catalogImportIdFromKebabId(kebab: string): string {
  const parts = kebab.split('-').filter(Boolean)
  const pascal = parts
    .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : ''))
    .join('')
  return `${pascal || 'Unnamed'}Component`
}
