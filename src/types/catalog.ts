export type CatalogComponentKind = 'component' | 'layout'

/**
 * One row in `_catalog.json` after publish. `id` is kebab-case (publish helper
 * `toKebabComponentId`). Components canvas uses `canvas-card-{nodeUuid}` for cards,
 * `canvas-primary-{nodeUuid}` for primary-button blocks, `canvas-secondary-{nodeUuid}` for
 * secondary-button blocks, `canvas-neutral-{nodeUuid}` for neutral buttons, and
 * `canvas-confirm-password-{nodeUuid}` for confirm-password inputs,
 * `canvas-text-field-{nodeUuid}` for text input fields, and
 * `canvas-product-sidebar-{nodeUuid}` for generative product sidebar blocks, and
 * `canvas-html-{nodeUuid}` for HTML creator snippets
 * once normalized — the same id is sent to `postDeleteComponent` when that
 * block is removed so the catalog row and generated blueprint/thumbnails are
 * cleared (no orphan entries).
 */
export type CatalogComponentEntry = {
  id: string
  publishedAt: string
  hasBlueprint: boolean
  apiEndpoint: string | null
  importId: string
  thumbnailPath: string
  blueprintPath: string
  /** Set by publish helper; omitted on older index rows (= treat as component). */
  kind?: CatalogComponentKind
}

export type CatalogIndexFile = {
  version: string
  lastUpdated: string
  components: CatalogComponentEntry[]
}

export type CatalogCardModel = {
  entry: CatalogComponentEntry
  blueprint: BlueprintDocument | null
  loadError?: string
}

export type BlueprintDocument = {
  schemaVersion?: string
  id: string
  component?: string
  importId?: string
  data?: {
    imageUrl?: string
    imageAlt?: string
    description?: string
    sealed?: boolean
    sourceHtml?: string
    classes?: string
    [key: string]: unknown
  }
  children?: unknown[]
}
