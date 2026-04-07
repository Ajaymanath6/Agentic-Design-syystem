/** Mirrors server LayoutPlanV1; validated JSON only — no model HTML. */

export type LayoutThemeKey =
  | 'heading.h1'
  | 'heading.h2'
  | 'heading.h3'
  | 'profileCard.name'
  | 'profileCard.title'
  | 'profileCard.body'

export type LayoutChromeBlock = {
  type: 'chrome'
  kind: 'pageHeading'
  title: string
  subtitle?: string
  titleThemeKey: LayoutThemeKey
  subtitleThemeKey?: LayoutThemeKey
}

export type LayoutCatalogBlock = {
  type: 'catalog'
  ref: string
  repeat: number
  layout: 'flow' | 'grid'
  grid?: { cols: number; rows: number }
}

export type LayoutPlanBlock = LayoutChromeBlock | LayoutCatalogBlock

export type LayoutPlanV1 = {
  version: 1
  blocks: LayoutPlanBlock[]
}

export function isLayoutPlanV1(v: unknown): v is LayoutPlanV1 {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (o.version !== 1) return false
  if (!Array.isArray(o.blocks)) return false
  return true
}
