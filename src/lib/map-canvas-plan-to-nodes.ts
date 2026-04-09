import type { CanvasNode } from './canvas-node-publish'
import type { CanvasPlanNodeSpec, CanvasPlanV1 } from '../types/canvas-plan'

const WORLD_W = 3200
const WORLD_H = 2400
const CANVAS_CARD_W = 280
const CANVAS_PRIMARY_W = 220
const STACK_GAP = 24

function heightForPlanSpec(spec: CanvasPlanNodeSpec): number {
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
function totalStackHeightPx(plan: CanvasPlanV1): number {
  const { nodes } = plan
  if (nodes.length === 0) return 0
  let sum = 0
  for (let i = 0; i < nodes.length; i++) {
    sum += heightForPlanSpec(nodes[i])
    if (i < nodes.length - 1) sum += STACK_GAP
  }
  return sum
}

const TOP_MARGIN = 40

/**
 * Place the new stack above existing content (smaller y) so it’s easy to spot.
 * If there’s no room above, clamp to TOP_MARGIN (may overlap — rare on empty top).
 */
function topYStartForNewStack(existing: CanvasNode[], plan: CanvasPlanV1): number {
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

function widthForKind(kind: CanvasPlanNodeSpec['kind']): number {
  if (
    kind === 'primaryButton' ||
    kind === 'secondaryButton' ||
    kind === 'neutralButton'
  ) {
    return CANVAS_PRIMARY_W
  }
  return CANVAS_CARD_W
}

function defaultXForKind(kind: CanvasPlanNodeSpec['kind']): number {
  const w = widthForKind(kind)
  return WORLD_W / 2 - w / 2
}

function clampCoord(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/**
 * Maps validated plan specs to new `CanvasNode` rows with fresh UUIDs.
 * When x/y omitted, stacks vertically starting **above** existing blocks (top of stack near top of world).
 */
export function mapCanvasPlanToNewNodes(
  plan: CanvasPlanV1,
  existing: CanvasNode[],
): CanvasNode[] {
  let cursorY = topYStartForNewStack(existing, plan)
  const out: CanvasNode[] = []

  for (const spec of plan.nodes) {
    const id = crypto.randomUUID()
    const w = widthForKind(spec.kind)
    const xDefault = defaultXForKind(spec.kind)
    let x = spec.x ?? xDefault
    let y = spec.y ?? cursorY
    x = clampCoord(x, 40, WORLD_W - w - 40)
    y = clampCoord(y, 40, WORLD_H - 200)

    if (spec.kind === 'card') {
      out.push({
        kind: 'card',
        id,
        x,
        y,
        title: spec.title.slice(0, 500),
        subtitle: spec.subtitle.slice(0, 500),
        body: spec.body.slice(0, 4000),
      })
      cursorY = y + 200 + STACK_GAP
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
      cursorY = y + 112 + STACK_GAP
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
      cursorY = y + 152 + STACK_GAP
    }
  }

  return out
}
