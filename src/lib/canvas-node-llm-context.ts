import type { CanvasReferencePayload } from '../types/components-canvas-plan-request'
import type { CanvasNode } from './canvas-node-publish'
import {
  buildCanvasCardPublishHtml,
  buildConfirmPasswordInputPublishHtml,
  buildNeutralButtonPublishHtml,
  buildPrimaryButtonPublishHtml,
  buildProductSidebarPublishHtml,
  buildSecondaryButtonPublishHtml,
  buildTextInputFieldPublishHtml,
  publishLabelForCanvasNode,
} from './canvas-node-publish'

/** User-visible component title / label for @-mentions (no id, no kind prefix). */
export function canvasMentionDisplayName(node: CanvasNode): string {
  return publishLabelForCanvasNode(node).trim()
}

export function escapeCanvasMentionQuotedLabel(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export function unescapeCanvasMentionQuotedLabel(s: string): string {
  let out = ''
  let i = 0
  while (i < s.length) {
    const c = s[i]!
    if (c === '\\' && i + 1 < s.length) {
      out += s[i + 1]!
      i += 2
      continue
    }
    out += c
    i++
  }
  return out
}

function isCanvasMentionSuffixClosed(after: string): boolean {
  if (after.includes('\n')) return true
  if (
    /^canvas:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      after,
    )
  ) {
    return true
  }
  if (!after.startsWith('canvas:"')) {
    return after.includes(' ')
  }
  const inner = after.slice('canvas:"'.length)
  let i = 0
  let esc = false
  while (i < inner.length) {
    const c = inner[i]!
    if (esc) {
      esc = false
      i++
      continue
    }
    if (c === '\\') {
      esc = true
      i++
      continue
    }
    if (c === '"') return true
    i++
  }
  return false
}

function canvasMentionFilterFromOpenSuffix(after: string): string {
  if (!after.startsWith('canvas:"')) {
    return after
  }
  const inner = after.slice('canvas:"'.length)
  let out = ''
  let i = 0
  let esc = false
  while (i < inner.length) {
    const c = inner[i]!
    if (esc) {
      out += c
      esc = false
      i++
      continue
    }
    if (c === '\\') {
      esc = true
      i++
      continue
    }
    if (c === '"') break
    out += c
    i++
  }
  return out
}

/**
 * When the HTML-creator @-mention menu should be open: position of `@` and filter text
 * (after `@`, before cursor). Supports `@canvas:"…"` with spaces inside quotes.
 */
export function getOpenCanvasMentionAtCursor(
  value: string,
  cursor: number,
  htmlMode: boolean,
): { start: number; filter: string } | null {
  if (!htmlMode) return null
  const before = value.slice(0, cursor)
  const at = before.lastIndexOf('@')
  if (at === -1) return null
  const after = before.slice(at + 1)
  if (isCanvasMentionSuffixClosed(after)) return null
  return { start: at, filter: canvasMentionFilterFromOpenSuffix(after) }
}

export const MAX_CANVAS_REFERENCE_BLOCKS = 12
export const MAX_CANVAS_REFERENCE_CONTEXT_CHARS = 10_000

function truncateContext(s: string): string {
  if (s.length <= MAX_CANVAS_REFERENCE_CONTEXT_CHARS) return s
  return `${s.slice(0, MAX_CANVAS_REFERENCE_CONTEXT_CHARS - 20)}… (truncated)`
}

/** HTML or compact description for the LLM for one canvas node. */
export function buildCanvasNodeLlmContextSnippet(node: CanvasNode): string {
  let html: string
  switch (node.kind) {
    case 'card':
      html = buildCanvasCardPublishHtml(node)
      break
    case 'primaryButton':
      html = buildPrimaryButtonPublishHtml(node)
      break
    case 'secondaryButton':
      html = buildSecondaryButtonPublishHtml(node)
      break
    case 'neutralButton':
      html = buildNeutralButtonPublishHtml(node)
      break
    case 'confirmPasswordInput':
      html = buildConfirmPasswordInputPublishHtml(node)
      break
    case 'textInputField':
      html = buildTextInputFieldPublishHtml(node)
      break
    case 'productSidebar':
      html = buildProductSidebarPublishHtml(node)
      break
    case 'htmlSnippet':
      html = node.html
      break
    default: {
      const _exhaustive: never = node
      return String(_exhaustive)
    }
  }
  return truncateContext(html.trim())
}

/**
 * Collects referenced node ids from `@canvas:<uuid>` and `@canvas:"Component name"` tokens.
 * Order follows first occurrence in the prompt. Duplicate labels resolve to the first matching
 * node in `nodes` array order.
 */
export function parseCanvasMentionIdsFromPrompt(
  prompt: string,
  nodes: CanvasNode[],
): string[] {
  const byLabel = new Map<string, CanvasNode[]>()
  for (const n of nodes) {
    const lab = canvasMentionDisplayName(n)
    const arr = byLabel.get(lab) ?? []
    arr.push(n)
    byLabel.set(lab, arr)
  }

  type Hit = { index: number; id: string }
  const hits: Hit[] = []

  for (const m of prompt.matchAll(/@canvas:"((?:\\.|[^"\\])*)"/gi)) {
    const label = unescapeCanvasMentionQuotedLabel(m[1] ?? '')
    const list = byLabel.get(label)
    const id = list?.[0]?.id
    if (id != null) hits.push({ index: m.index ?? 0, id })
  }

  const uuidRe =
    /@canvas:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi
  for (const m of prompt.matchAll(uuidRe)) {
    hits.push({ index: m.index ?? 0, id: m[1]! })
  }

  hits.sort((a, b) => a.index - b.index)
  const seen = new Set<string>()
  const out: string[] = []
  for (const h of hits) {
    if (seen.has(h.id)) continue
    if (!nodes.some((n) => n.id === h.id)) continue
    seen.add(h.id)
    out.push(h.id)
    if (out.length >= MAX_CANVAS_REFERENCE_BLOCKS) break
  }
  return out
}

/** Build API `canvas_references` from explicit picks (badges) plus `@canvas:` tokens in prompt. */
export function buildCanvasReferencesForRequest(
  prompt: string,
  nodes: CanvasNode[],
  explicitRefIds?: readonly string[],
): CanvasReferencePayload[] | undefined {
  const fromPrompt = parseCanvasMentionIdsFromPrompt(prompt, nodes)
  const seen = new Set<string>()
  const ids: string[] = []
  for (const id of [...(explicitRefIds ?? []), ...fromPrompt]) {
    if (!nodes.some((n) => n.id === id)) continue
    if (seen.has(id)) continue
    seen.add(id)
    ids.push(id)
    if (ids.length >= MAX_CANVAS_REFERENCE_BLOCKS) break
  }
  if (ids.length === 0) return undefined
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const refs: CanvasReferencePayload[] = []
  for (const id of ids) {
    const node = byId.get(id)
    if (!node) continue
    refs.push({
      node_id: id,
      kind: node.kind,
      context: buildCanvasNodeLlmContextSnippet(node),
    })
  }
  return refs.length > 0 ? refs : undefined
}

export function canvasNodeMentionLabel(node: CanvasNode): string {
  const label = publishLabelForCanvasNode(node)
  const short =
    label.length > 40 ? `${label.slice(0, 37)}…` : label
  return `${node.kind}: ${short}`
}

/** Remove `@canvas:<id>` and `@canvas:"name"` tokens for this node; collapse spaces. */
export function removeCanvasMentionFromPrompt(
  value: string,
  node: CanvasNode,
): string {
  const idToken = `@canvas:${node.id}`
  const quoted = `@canvas:"${escapeCanvasMentionQuotedLabel(canvasMentionDisplayName(node))}"`
  let next = value.split(idToken).join('').split(quoted).join('')
  return next.replace(/\s{2,}/g, ' ').trim()
}
