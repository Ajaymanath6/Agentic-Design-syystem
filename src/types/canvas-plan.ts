/**
 * Mirrors FastAPI canvas plan JSON (`POST /canvas/plan`). No `id` — client assigns UUIDs.
 * Server `model_dump(mode="json")` uses snake_case for v2 sidebar fields.
 */

export type CanvasPlanCardNode = {
  kind: 'card'
  title: string
  subtitle: string
  body: string
  x?: number
  y?: number
}

export type CanvasPlanButtonNode = {
  kind: 'primaryButton' | 'secondaryButton' | 'neutralButton'
  label: string
  x?: number
  y?: number
}

export type CanvasPlanInputNode = {
  kind: 'confirmPasswordInput' | 'textInputField'
  label: string
  x?: number
  y?: number
}

export type ProductSidebarNavIconKey =
  | 'home'
  | 'folder'
  | 'task'
  | 'fileText'
  | 'key'
  | 'history'
  | 'none'

export type ProductSidebarHeaderIconKey =
  | 'chevronUpDown'
  | 'chevronUp'
  | 'chevronDown'
  | 'none'

export type CanvasPlanProductSidebarNavItem = {
  label: string
  /** Omitted in some model outputs; treated as `none` when mapping to canvas nodes. */
  icon_key?: ProductSidebarNavIconKey
}

export type CanvasPlanProductSidebarSection = {
  heading: string
  items: CanvasPlanProductSidebarNavItem[]
}

export type CanvasPlanProductSidebarNode = {
  kind: 'productSidebar'
  title: string
  trailing_icon_key?: ProductSidebarHeaderIconKey
  search_placeholder?: string
  neutral_button_label?: string
  sections: CanvasPlanProductSidebarSection[]
  x?: number
  y?: number
}

export type CanvasPlanNodeSpecV1 =
  | CanvasPlanCardNode
  | CanvasPlanButtonNode
  | CanvasPlanInputNode

export type CanvasPlanNodeSpecV2 =
  | CanvasPlanNodeSpecV1
  | CanvasPlanProductSidebarNode

export type CanvasPlanV1 = {
  version: 1
  nodes: CanvasPlanNodeSpecV1[]
}

export type CanvasPlanV2 = {
  version: 2
  nodes: CanvasPlanNodeSpecV2[]
}

export type CanvasPlan = CanvasPlanV1 | CanvasPlanV2

const BUTTON_KINDS = new Set([
  'primaryButton',
  'secondaryButton',
  'neutralButton',
])

const INPUT_KINDS = new Set(['confirmPasswordInput', 'textInputField'])

const NAV_ICON_KEYS = new Set<ProductSidebarNavIconKey>([
  'home',
  'folder',
  'task',
  'fileText',
  'key',
  'history',
  'none',
])

const HEADER_ICON_KEYS = new Set<ProductSidebarHeaderIconKey>([
  'chevronUpDown',
  'chevronUp',
  'chevronDown',
  'none',
])

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function parseOptionalCoord(v: unknown): number | undefined {
  if (v == null) return undefined
  if (!isFiniteNumber(v)) return undefined
  return v
}

function isProductSidebarNavItem(v: unknown): v is CanvasPlanProductSidebarNavItem {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.label !== 'string' || o.label.length < 1) return false
  const ik = o.icon_key ?? o.iconKey
  if (ik == null) return true
  if (typeof ik !== 'string' || !NAV_ICON_KEYS.has(ik as ProductSidebarNavIconKey)) {
    return false
  }
  return true
}

function normalizeNavItem(
  row: Record<string, unknown>,
): CanvasPlanProductSidebarNavItem {
  const ik = row.icon_key ?? row.iconKey
  const icon_key: ProductSidebarNavIconKey =
    typeof ik === 'string' && NAV_ICON_KEYS.has(ik as ProductSidebarNavIconKey)
      ? (ik as ProductSidebarNavIconKey)
      : 'none'
  return { label: String(row.label), icon_key }
}

function isProductSidebarSection(
  v: unknown,
): v is CanvasPlanProductSidebarSection {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.heading !== 'string' || o.heading.length < 1) return false
  if (!Array.isArray(o.items) || o.items.length < 1) return false
  for (const it of o.items) {
    if (!isProductSidebarNavItem(it)) return false
  }
  return true
}

function normalizeProductSidebarSection(
  raw: Record<string, unknown>,
): CanvasPlanProductSidebarSection {
  const items = (raw.items as unknown[]).map((it) =>
    normalizeNavItem(it as Record<string, unknown>),
  )
  return { heading: String(raw.heading), items }
}

function isPlanProductSidebarNode(
  v: unknown,
): v is CanvasPlanProductSidebarNode {
  if (!v || typeof v !== 'object') return false
  const row = v as Record<string, unknown>
  if (row.kind !== 'productSidebar') return false
  if (typeof row.title !== 'string' || row.title.length < 1) return false
  const tk = row.trailing_icon_key ?? row.trailingIconKey
  if (
    tk != null &&
    (typeof tk !== 'string' ||
      !HEADER_ICON_KEYS.has(tk as ProductSidebarHeaderIconKey))
  ) {
    return false
  }
  const sp = row.search_placeholder ?? row.searchPlaceholder
  if (sp != null && typeof sp !== 'string') return false
  const nb = row.neutral_button_label ?? row.neutralButtonLabel
  if (nb != null && typeof nb !== 'string') return false
  if (!Array.isArray(row.sections) || row.sections.length < 1) return false
  for (const s of row.sections) {
    if (!isProductSidebarSection(s)) return false
  }
  return true
}

function normalizeProductSidebarNode(
  row: Record<string, unknown>,
): CanvasPlanProductSidebarNode {
  const tk = row.trailing_icon_key ?? row.trailingIconKey
  const trailing_icon_key: ProductSidebarHeaderIconKey =
    typeof tk === 'string' && HEADER_ICON_KEYS.has(tk as ProductSidebarHeaderIconKey)
      ? (tk as ProductSidebarHeaderIconKey)
      : 'none'
  const sp = row.search_placeholder ?? row.searchPlaceholder
  const nb = row.neutral_button_label ?? row.neutralButtonLabel
  const sections = (row.sections as unknown[]).map((s) =>
    normalizeProductSidebarSection(s as Record<string, unknown>),
  )
  return {
    kind: 'productSidebar',
    title: String(row.title),
    trailing_icon_key,
    search_placeholder: sp == null ? '' : String(sp),
    neutral_button_label: nb == null ? '' : String(nb),
    sections,
    x: parseOptionalCoord(row.x),
    y: parseOptionalCoord(row.y),
  }
}

function isV1NodeSpec(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false
  const row = v as Record<string, unknown>
  const kind = row.kind
  if (typeof kind !== 'string') return false
  if (kind === 'card') {
    const ok = (x: unknown) => x == null || typeof x === 'string'
    return ok(row.title) && ok(row.subtitle) && ok(row.body)
  }
  if (BUTTON_KINDS.has(kind)) {
    return typeof row.label === 'string'
  }
  if (INPUT_KINDS.has(kind)) {
    return typeof row.label === 'string'
  }
  return false
}

export function isCanvasPlanV1(v: unknown): v is CanvasPlanV1 {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (o.version !== 1) return false
  if (!Array.isArray(o.nodes) || o.nodes.length === 0) return false
  for (const n of o.nodes) {
    if (!isV1NodeSpec(n)) return false
  }
  return true
}

export function isCanvasPlanV2(v: unknown): v is CanvasPlanV2 {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (o.version !== 2) return false
  if (!Array.isArray(o.nodes) || o.nodes.length === 0) return false
  for (const n of o.nodes) {
    if (!n || typeof n !== 'object') return false
    const row = n as Record<string, unknown>
    if (row.kind === 'productSidebar') {
      if (!isPlanProductSidebarNode(n)) return false
      continue
    }
    if (!isV1NodeSpec(n)) return false
  }
  return true
}

export function isCanvasPlan(v: unknown): v is CanvasPlan {
  return isCanvasPlanV1(v) || isCanvasPlanV2(v)
}

/**
 * Returns a normalized plan (camelCase input from LLM folded to snake_case shapes).
 */
export function normalizeCanvasPlan(raw: CanvasPlan): CanvasPlan {
  if (raw.version === 1) return raw
  const nodes: CanvasPlanNodeSpecV2[] = raw.nodes.map((spec) => {
    if (spec.kind !== 'productSidebar') return spec
    return normalizeProductSidebarNode({
      ...(spec as unknown as Record<string, unknown>),
    })
  })
  return { version: 2, nodes }
}
