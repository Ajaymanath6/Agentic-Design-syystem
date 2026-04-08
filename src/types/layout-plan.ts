/** Mirrors server LayoutPlanV1; validated JSON only — no model HTML. */

import type { LayoutAfterGap } from '../lib/layout-spacing-resolve'

export type { LayoutAfterGap }

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
  /** Space before the next sibling (top-level or within column). */
  afterGap?: LayoutAfterGap
}

export type LayoutCatalogBlock = {
  type: 'catalog'
  ref: string
  repeat: number
  layout: 'flow' | 'grid'
  grid?: { cols: number; rows: number }
  afterGap?: LayoutAfterGap
}

/** Only chrome + catalog inside rows/splits (no nested containers). */
export type LayoutLeafBlock = LayoutChromeBlock | LayoutCatalogBlock

export type LayoutRowColumn = {
  children: LayoutLeafBlock[]
}

export type LayoutRowStackBelow = 'sm' | 'md' | 'lg'

export type LayoutRowBlock = {
  type: 'row'
  columns: LayoutRowColumn[]
  /** When columns stack vertically below this breakpoint (default md). */
  stackBelow?: LayoutRowStackBelow
  afterGap?: LayoutAfterGap
}

export type LayoutSplitVariant = 'sidebarMain'

export type LayoutSplitSidebarPlacement = 'start' | 'end'

export type LayoutSplitSidebarWidth = 'narrow' | 'default' | 'wide'

export type LayoutSplitBlock = {
  type: 'split'
  variant: LayoutSplitVariant
  sidebar: LayoutLeafBlock[]
  main: LayoutLeafBlock[]
  sidebarPlacement?: LayoutSplitSidebarPlacement
  sidebarWidth?: LayoutSplitSidebarWidth
  afterGap?: LayoutAfterGap
}

export type LayoutPlanBlock =
  | LayoutLeafBlock
  | LayoutRowBlock
  | LayoutSplitBlock

export type LayoutPlanV1 = {
  version: 1
  /** When a block omits afterGap, use this; else client infers chrome/catalog pairs (often space-4). */
  defaultAfterGap?: LayoutAfterGap
  blocks: LayoutPlanBlock[]
}

const TOP_LEVEL_TYPES = new Set([
  'chrome',
  'catalog',
  'row',
  'split',
])

export function isLayoutPlanV1(v: unknown): v is LayoutPlanV1 {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (o.version !== 1) return false
  if (!Array.isArray(o.blocks)) return false
  return o.blocks.every((b) => {
    if (!b || typeof b !== 'object') return false
    const t = (b as { type?: unknown }).type
    return typeof t === 'string' && TOP_LEVEL_TYPES.has(t)
  })
}
