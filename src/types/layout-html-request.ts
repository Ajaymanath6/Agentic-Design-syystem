/** Request body for POST /layout/generate-html — keep in sync with LLM agent `LayoutHtmlRequestBody`. */

export type LayoutCatalogReferenceBlock = {
  id: string
  label: string
  htmlSnippet: string
}

export type ThemeSnapshotColors = {
  colors?: Partial<Record<string, string>>
}

export type LayoutHtmlGenerateRequest = {
  prompt: string
  catalogAllowlist: string[]
  catalogReferenceBlocks?: LayoutCatalogReferenceBlock[]
  extended_design_context?: boolean
  spacing_enforcement?: boolean
  theme_snapshot?: ThemeSnapshotColors
}

/** Per-snippet cap for Vertex context size (matches Python `LayoutCatalogReferenceBlock.htmlSnippet` max). */
export const MAX_LAYOUT_CATALOG_REFERENCE_HTML_SNIPPET_CHARS = 16000
