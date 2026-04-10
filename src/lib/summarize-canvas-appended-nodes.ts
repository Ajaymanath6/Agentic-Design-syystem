import type { CanvasNode } from './canvas-node-publish'
import { publishLabelForCanvasNode } from './canvas-node-publish'

/** Short assistant line for multi-turn context (not shown verbatim to end users as primary UI). */
export function summarizeAppendedCanvasNodes(nodes: CanvasNode[]): string {
  if (nodes.length === 0) return 'No new components were added.'
  if (nodes.every((n) => n.kind === 'htmlSnippet')) {
    return nodes.length === 1
      ? 'Added an HTML block to the canvas.'
      : `Added ${nodes.length} HTML blocks to the canvas.`
  }
  const parts = nodes.map((n) => {
    const label = publishLabelForCanvasNode(n)
    const short = label.length > 48 ? `${label.slice(0, 45)}…` : label
    return `${n.kind}: ${short}`
  })
  return `Added to canvas: ${parts.join('; ')}.`
}
