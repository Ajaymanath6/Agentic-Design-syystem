import type { CatalogCardModel } from '../types/catalog'
import { canvasNodeFootprint } from './canvas-node-footprint'
import {
  componentCatalogIdForCanvasNode,
  type CanvasNode,
} from './canvas-node-publish'
import { isCanvasWorldCatalogId } from './canvas-board-storage'
import { isCatalogLayoutEntry } from './catalog-layout-entry'
import { catalogCardDisplayName } from './catalog-display-name'
import { sanitizeCanvasHtmlFragment } from './sanitize-canvas-html'

const WORLD_W = 3200
const WORLD_H = 2400
const STACK_GAP = 24
const TOP_MARGIN = 40

const UUID_SUFFIX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const PREFIX_KIND: { prefix: string; kind: CanvasNode['kind'] }[] = [
  { prefix: 'canvas-confirm-password', kind: 'confirmPasswordInput' },
  { prefix: 'canvas-text-field', kind: 'textInputField' },
  { prefix: 'canvas-product-sidebar', kind: 'productSidebar' },
  { prefix: 'canvas-secondary', kind: 'secondaryButton' },
  { prefix: 'canvas-primary', kind: 'primaryButton' },
  { prefix: 'canvas-neutral', kind: 'neutralButton' },
  { prefix: 'canvas-html', kind: 'htmlSnippet' },
  { prefix: 'canvas-card', kind: 'card' },
]

export type ParsedCanvasCatalogId = {
  kind: CanvasNode['kind']
  nodeId: string
}

export function parseCanvasComponentCatalogId(
  entryId: string,
): ParsedCanvasCatalogId | null {
  for (const { prefix, kind } of PREFIX_KIND) {
    const head = `${prefix}-`
    if (!entryId.startsWith(head)) continue
    const nodeId = entryId.slice(head.length)
    if (UUID_SUFFIX.test(nodeId)) return { kind, nodeId }
  }
  return null
}

function clampCoord(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function textFromHtml(html: string, selector: string): string {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.querySelector(selector)?.textContent?.trim() ?? ''
  } catch {
    return ''
  }
}

function paragraphTextsFromHtml(html: string): string[] {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return Array.from(doc.querySelectorAll('p')).map(
      (p) => p.textContent?.trim() ?? '',
    )
  } catch {
    return []
  }
}

/** Rebuild a canvas block from a published catalog row (sourceHtml + entry id). */
export function canvasNodeFromCatalogCard(
  card: CatalogCardModel,
): CanvasNode | null {
  const parsed = parseCanvasComponentCatalogId(card.entry.id)
  if (!parsed || !card.blueprint) return null

  const sourceHtml = card.blueprint.data?.sourceHtml
  const label = catalogCardDisplayName(card)
  const { kind, nodeId } = parsed

  if (kind === 'htmlSnippet') {
    if (typeof sourceHtml !== 'string' || !sourceHtml.trim()) return null
    const safe = sanitizeCanvasHtmlFragment(sourceHtml)
    if (!safe.trim()) return null
    return { kind, id: nodeId, x: 0, y: 0, label, html: safe }
  }

  if (
    kind === 'primaryButton' ||
    kind === 'secondaryButton' ||
    kind === 'neutralButton'
  ) {
    const btnLabel =
      (typeof sourceHtml === 'string' ? textFromHtml(sourceHtml, 'button') : '') ||
      label
    return { kind, id: nodeId, x: 0, y: 0, label: btnLabel || label }
  }

  if (kind === 'confirmPasswordInput' || kind === 'textInputField') {
    const fieldLabel =
      (typeof sourceHtml === 'string' ? textFromHtml(sourceHtml, 'label') : '') ||
      label
    return { kind, id: nodeId, x: 0, y: 0, label: fieldLabel || label }
  }

  if (kind === 'card') {
    const paragraphs =
      typeof sourceHtml === 'string' ? paragraphTextsFromHtml(sourceHtml) : []
    const title =
      (typeof sourceHtml === 'string' ? textFromHtml(sourceHtml, 'h3') : '') ||
      label
    return {
      kind: 'card',
      id: nodeId,
      x: 0,
      y: 0,
      title: title || label,
      subtitle: paragraphs[0] ?? '',
      body: paragraphs[1] ?? paragraphs[0] ?? '',
    }
  }

  return {
    kind: 'productSidebar',
    id: nodeId,
    x: 0,
    y: 0,
    title: label,
    trailing_icon_key: 'none',
    search_placeholder: '',
    neutral_button_label: '',
    sections: [
      {
        heading: 'Navigation',
        items: [{ label: 'Item', icon_key: 'none' }],
      },
    ],
  }
}

function stackHeight(nodes: CanvasNode[]): number {
  if (nodes.length === 0) return 0
  let sum = 0
  for (let i = 0; i < nodes.length; i++) {
    sum += canvasNodeFootprint(nodes[i]!).h
    if (i < nodes.length - 1) sum += STACK_GAP
  }
  return sum
}

function topYForNewStack(existing: CanvasNode[], incoming: CanvasNode[]): number {
  const stackH = stackHeight(incoming)
  if (existing.length === 0) return TOP_MARGIN
  let minY = Infinity
  for (const n of existing) {
    minY = Math.min(minY, n.y)
  }
  return Math.max(TOP_MARGIN, minY - STACK_GAP - stackH)
}

function layoutIncomingCatalogNodes(
  existing: CanvasNode[],
  incoming: CanvasNode[],
): CanvasNode[] {
  let cursorY = topYForNewStack(existing, incoming)
  return incoming.map((node) => {
    const { w, h } = canvasNodeFootprint(node)
    let x = WORLD_W / 2 - w / 2
    let y = cursorY
    x = clampCoord(x, 40, WORLD_W - w - 40)
    y = clampCoord(y, 40, WORLD_H - h - 40)
    cursorY = y + h + STACK_GAP
    return { ...node, x, y }
  })
}

/**
 * Ensure every published components-canvas catalog row has a matching world block.
 * Adds missing blocks from blueprint data; never removes existing canvas nodes.
 */
export function mergePublishedCatalogOntoCanvas(
  nodes: CanvasNode[],
  cards: CatalogCardModel[],
): CanvasNode[] {
  const catalogIdsOnBoard = new Set(nodes.map(componentCatalogIdForCanvasNode))
  const nodeIdsOnBoard = new Set(nodes.map((n) => n.id))

  const missing: CanvasNode[] = []

  for (const card of cards) {
    if (isCatalogLayoutEntry(card.entry)) continue
    if (!isCanvasWorldCatalogId(card.entry.id)) continue
    if (!card.blueprint) continue
    if (catalogIdsOnBoard.has(card.entry.id)) continue

    const parsed = parseCanvasComponentCatalogId(card.entry.id)
    if (!parsed || nodeIdsOnBoard.has(parsed.nodeId)) continue

    const node = canvasNodeFromCatalogCard(card)
    if (!node) continue

    missing.push(node)
    nodeIdsOnBoard.add(node.id)
    catalogIdsOnBoard.add(card.entry.id)
  }

  if (missing.length === 0) return nodes

  return [...nodes, ...layoutIncomingCatalogNodes(nodes, missing)]
}
