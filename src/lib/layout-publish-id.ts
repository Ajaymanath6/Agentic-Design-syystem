import type { LayoutPlanBlock } from '../types/layout-plan'

function fnv1a32ToBase36(s: string): string {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

/** Stable kebab-safe id segment: same `blocks` → same catalog row on republish. */
export function layoutPlanBlocksPublishComponentId(
  blocks: LayoutPlanBlock[],
): string {
  return `layout-${fnv1a32ToBase36(JSON.stringify(blocks))}`
}

/** Stable id for a generative HTML layout publish (hash of wrapped source). */
export function layoutGenerativeHtmlPublishComponentId(sourceHtml: string): string {
  return `layout-html-${fnv1a32ToBase36(sourceHtml.trim())}`
}

export function layoutPublishLabelFromPrompt(prompt: string): string {
  const line = prompt.trim().split(/\n/)[0]?.trim() ?? ''
  if (!line) return 'Layout'
  return line.length > 80 ? `${line.slice(0, 77)}...` : line
}
