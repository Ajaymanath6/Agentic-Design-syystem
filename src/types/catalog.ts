export type CatalogComponentKind = 'component' | 'layout'

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
