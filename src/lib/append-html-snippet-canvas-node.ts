import type { CanvasHtmlSnippetBlock, CanvasNode } from './canvas-node-publish'

const WORLD_W = 3200
const WORLD_H = 2400
const STACK_GAP = 24
const TOP_MARGIN = 40

/** Preview shell size (scroll inside if content is taller). */
export const HTML_SNIPPET_BLOCK_W = 320
export const HTML_SNIPPET_BLOCK_H = 300

function clampCoord(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function topYForSingleBlockAbove(existing: CanvasNode[], blockH: number): number {
  if (existing.length === 0) {
    return TOP_MARGIN
  }
  let minY = Infinity
  for (const n of existing) {
    minY = Math.min(minY, n.y)
  }
  const idealTop = minY - STACK_GAP - blockH
  return Math.max(TOP_MARGIN, idealTop)
}

/**
 * Append one creator-mode HTML block above existing nodes (same placement idea as plan mapper).
 */
export function createHtmlSnippetCanvasNode(
  existing: CanvasNode[],
  html: string,
  label: string,
): CanvasHtmlSnippetBlock {
  const id = crypto.randomUUID()
  const w = HTML_SNIPPET_BLOCK_W
  const h = HTML_SNIPPET_BLOCK_H
  let x = WORLD_W / 2 - w / 2
  let y = topYForSingleBlockAbove(existing, h)
  x = clampCoord(x, 40, WORLD_W - w - 40)
  y = clampCoord(y, 40, WORLD_H - h - 40)
  return {
    kind: 'htmlSnippet',
    id,
    x,
    y,
    label: label.slice(0, 200),
    html,
  }
}
