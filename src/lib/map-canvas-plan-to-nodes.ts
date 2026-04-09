import type { CanvasNode } from './canvas-node-publish'
import {
  heightPxForProductSidebarPayload,
  PRODUCT_SIDEBAR_WIDTH_PX,
} from './canvas-product-sidebar-metrics'
import type {
  CanvasPlan,
  CanvasPlanNodeSpecV2,
  CanvasPlanProductSidebarNode,
} from '../types/canvas-plan'
import { normalizeCanvasPlan } from '../types/canvas-plan'

const WORLD_W = 3200
const WORLD_H = 2400
const CANVAS_CARD_W = 280
const CANVAS_PRIMARY_W = 220
const STACK_GAP = 24

function heightForPlanSpec(spec: CanvasPlanNodeSpecV2): number {
  if (spec.kind === 'productSidebar') {
    return heightPxForProductSidebarPayload({
      search_placeholder: spec.search_placeholder ?? '',
      neutral_button_label: spec.neutral_button_label ?? '',
      sections: spec.sections.map((s) => ({
        items: s.items.map((it) => ({
          label: it.label,
          icon_key: it.icon_key ?? 'none',
        })),
      })),
    })
  }
  if (
    spec.kind === 'primaryButton' ||
    spec.kind === 'secondaryButton' ||
    spec.kind === 'neutralButton'
  ) {
    return 112
  }
  if (spec.kind === 'confirmPasswordInput' || spec.kind === 'textInputField') {
    return 152
  }
  return 200
}

/** Vertical span of this plan’s stack (gaps between nodes included). */
function totalStackHeightPx(plan: CanvasPlan): number {
  const { nodes } = plan
  if (nodes.length === 0) return 0
  let sum = 0
  for (let i = 0; i < nodes.length; i++) {
    sum += heightForPlanSpec(nodes[i] as CanvasPlanNodeSpecV2)
    if (i < nodes.length - 1) sum += STACK_GAP
  }
  return sum
}

const TOP_MARGIN = 40

/**
 * Place the new stack above existing content (smaller y) so it’s easy to spot.
 * If there’s no room above, clamp to TOP_MARGIN (may overlap — rare on empty top).
 */
function topYStartForNewStack(existing: CanvasNode[], plan: CanvasPlan): number {
  const stackH = totalStackHeightPx(plan)
  if (existing.length === 0) {
    return TOP_MARGIN
  }
  let minY = Infinity
  for (const n of existing) {
    minY = Math.min(minY, n.y)
  }
  const idealTop = minY - STACK_GAP - stackH
  return Math.max(TOP_MARGIN, idealTop)
}

function widthForSpec(spec: CanvasPlanNodeSpecV2): number {
  if (spec.kind === 'productSidebar') {
    return PRODUCT_SIDEBAR_WIDTH_PX
  }
  if (
    spec.kind === 'primaryButton' ||
    spec.kind === 'secondaryButton' ||
    spec.kind === 'neutralButton'
  ) {
    return CANVAS_PRIMARY_W
  }
  return CANVAS_CARD_W
}

function defaultXForSpec(spec: CanvasPlanNodeSpecV2): number {
  const w = widthForSpec(spec)
  return WORLD_W / 2 - w / 2
}

function clampCoord(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function mapProductSidebarSpecToBlock(
  spec: CanvasPlanProductSidebarNode,
  id: string,
  x: number,
  y: number,
): CanvasNode {
  const title = String(spec.title ?? '').slice(0, 200)
  const trailing_icon_key = spec.trailing_icon_key ?? 'none'
  const search_placeholder = String(spec.search_placeholder ?? '').slice(0, 200)
  const neutral_button_label = String(spec.neutral_button_label ?? '').slice(
    0,
    200,
  )
  const sections = spec.sections.slice(0, 8).map((sec) => ({
    heading: String(sec.heading ?? '').slice(0, 200),
    items: sec.items.slice(0, 24).map((it) => ({
      label: String(it.label ?? '').slice(0, 200),
      icon_key: it.icon_key ?? 'none',
    })),
  }))
  return {
    kind: 'productSidebar',
    id,
    x,
    y,
    title,
    trailing_icon_key,
    search_placeholder,
    neutral_button_label,
    sections,
  }
}

/**
 * Maps validated plan specs to new `CanvasNode` rows with fresh UUIDs.
 * When x/y omitted, stacks vertically starting **above** existing blocks (top of stack near top of world).
 */
export function mapCanvasPlanToNewNodes(
  plan: CanvasPlan,
  existing: CanvasNode[],
): CanvasNode[] {
  const normalized = plan.version === 2 ? normalizeCanvasPlan(plan) : plan
  let cursorY = topYStartForNewStack(existing, normalized)
  const out: CanvasNode[] = []

  for (const spec of normalized.nodes) {
    const id = crypto.randomUUID()
    const w = widthForSpec(spec as CanvasPlanNodeSpecV2)
    const xDefault = defaultXForSpec(spec as CanvasPlanNodeSpecV2)
    const h = heightForPlanSpec(spec as CanvasPlanNodeSpecV2)
    let x = spec.x ?? xDefault
    let y = spec.y ?? cursorY
    x = clampCoord(x, 40, WORLD_W - w - 40)
    y = clampCoord(y, 40, WORLD_H - h - 40)

    if (spec.kind === 'card') {
      const title = String(spec.title ?? '').slice(0, 500)
      const subtitle = String(spec.subtitle ?? '').slice(0, 500)
      const body = String(spec.body ?? '').slice(0, 4000)
      out.push({
        kind: 'card',
        id,
        x,
        y,
        title,
        subtitle,
        body,
      })
      cursorY = y + h + STACK_GAP
      continue
    }
    if (spec.kind === 'productSidebar') {
      out.push(mapProductSidebarSpecToBlock(spec, id, x, y))
      cursorY = y + h + STACK_GAP
      continue
    }
    if (
      spec.kind === 'primaryButton' ||
      spec.kind === 'secondaryButton' ||
      spec.kind === 'neutralButton'
    ) {
      out.push({
        kind: spec.kind,
        id,
        x,
        y,
        label: spec.label.slice(0, 200),
      })
      cursorY = y + h + STACK_GAP
      continue
    }
    if (
      spec.kind === 'confirmPasswordInput' ||
      spec.kind === 'textInputField'
    ) {
      out.push({
        kind: spec.kind,
        id,
        x,
        y,
        label: spec.label.slice(0, 200),
      })
      cursorY = y + h + STACK_GAP
    }
  }

  return out
}
