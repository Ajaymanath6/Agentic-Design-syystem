import { coerceCanvasControlLabel } from './coerce-canvas-control-label'
import {
  componentCatalogIdForCanvasNode,
  type CanvasNode,
  type CanvasProductSidebarBlock,
} from './canvas-node-publish'
import type {
  ProductSidebarHeaderIconKey,
  ProductSidebarNavIconKey,
} from '../types/canvas-plan'

export const CANVAS_NODES_STORAGE_KEY = 'agentic-components-canvas-nodes-v1'

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

/** Catalog ids produced from the components canvas world (publish / prune targets). */
export function isCanvasWorldCatalogId(id: string): boolean {
  return (
    typeof id === 'string' &&
    (id.startsWith('canvas-card-') ||
      id.startsWith('canvas-primary-') ||
      id.startsWith('canvas-secondary-') ||
      id.startsWith('canvas-neutral-') ||
      id.startsWith('canvas-confirm-password-') ||
      id.startsWith('canvas-text-field-') ||
      id.startsWith('canvas-product-sidebar-') ||
      id.startsWith('canvas-html-'))
  )
}

export function parseStoredCanvasNode(
  o: Record<string, unknown>,
): CanvasNode | null {
  if (
    typeof o.id !== 'string' ||
    typeof o.x !== 'number' ||
    typeof o.y !== 'number'
  ) {
    return null
  }
  if (o.kind === 'primaryButton') {
    if (typeof o.label !== 'string') return null
    return {
      kind: 'primaryButton',
      id: o.id,
      x: o.x,
      y: o.y,
      label: coerceCanvasControlLabel(o.label).slice(0, 200),
    }
  }
  if (o.kind === 'secondaryButton') {
    if (typeof o.label !== 'string') return null
    return {
      kind: 'secondaryButton',
      id: o.id,
      x: o.x,
      y: o.y,
      label: coerceCanvasControlLabel(o.label).slice(0, 200),
    }
  }
  if (o.kind === 'neutralButton') {
    if (typeof o.label !== 'string') return null
    return {
      kind: 'neutralButton',
      id: o.id,
      x: o.x,
      y: o.y,
      label: coerceCanvasControlLabel(o.label).slice(0, 200),
    }
  }
  if (o.kind === 'confirmPasswordInput') {
    if (typeof o.label !== 'string') return null
    return {
      kind: 'confirmPasswordInput',
      id: o.id,
      x: o.x,
      y: o.y,
      label: coerceCanvasControlLabel(o.label).slice(0, 200),
    }
  }
  if (o.kind === 'textInputField') {
    if (typeof o.label !== 'string') return null
    return {
      kind: 'textInputField',
      id: o.id,
      x: o.x,
      y: o.y,
      label: coerceCanvasControlLabel(o.label).slice(0, 200),
    }
  }
  if (o.kind === 'productSidebar') {
    if (typeof o.title !== 'string' || o.title.length < 1) return null
    const tk = o.trailing_icon_key ?? o.trailingIconKey
    const trailing_icon_key: ProductSidebarHeaderIconKey =
      typeof tk === 'string' && HEADER_ICON_KEYS.has(tk as ProductSidebarHeaderIconKey)
        ? (tk as ProductSidebarHeaderIconKey)
        : 'none'
    const sp = o.search_placeholder ?? o.searchPlaceholder
    const nb = o.neutral_button_label ?? o.neutralButtonLabel
    if (sp != null && typeof sp !== 'string') return null
    if (nb != null && typeof nb !== 'string') return null
    if (!Array.isArray(o.sections) || o.sections.length < 1) return null
    const sections: CanvasProductSidebarBlock['sections'] = []
    for (const sec of o.sections) {
      if (!sec || typeof sec !== 'object') return null
      const s = sec as Record<string, unknown>
      if (typeof s.heading !== 'string' || s.heading.length < 1) return null
      if (!Array.isArray(s.items) || s.items.length < 1) return null
      const items: CanvasProductSidebarBlock['sections'][0]['items'] = []
      for (const it of s.items) {
        if (!it || typeof it !== 'object') return null
        const row = it as Record<string, unknown>
        if (typeof row.label !== 'string' || row.label.length < 1) return null
        const ik = row.icon_key ?? row.iconKey
        const icon_key: ProductSidebarNavIconKey =
          typeof ik === 'string' && NAV_ICON_KEYS.has(ik as ProductSidebarNavIconKey)
            ? (ik as ProductSidebarNavIconKey)
            : 'none'
        items.push({ label: row.label, icon_key })
      }
      sections.push({ heading: s.heading, items })
    }
    return {
      kind: 'productSidebar',
      id: o.id,
      x: o.x,
      y: o.y,
      title: o.title,
      trailing_icon_key,
      search_placeholder: sp == null ? '' : sp,
      neutral_button_label: nb == null ? '' : nb,
      sections,
    }
  }
  if (o.kind === 'htmlSnippet') {
    if (typeof o.label !== 'string' || o.label.length < 1) return null
    if (typeof o.html !== 'string' || o.html.length < 1) return null
    const shellHeightPx =
      typeof o.shellHeightPx === 'number' &&
      Number.isFinite(o.shellHeightPx) &&
      o.shellHeightPx > 0
        ? o.shellHeightPx
        : undefined
    return {
      kind: 'htmlSnippet',
      id: o.id,
      x: o.x,
      y: o.y,
      label: o.label,
      html: o.html,
      ...(shellHeightPx != null ? { shellHeightPx } : {}),
    }
  }
  if (
    o.kind === 'card' ||
    o.kind === undefined ||
    o.kind === null
  ) {
    if (
      typeof o.title === 'string' &&
      typeof o.subtitle === 'string' &&
      typeof o.body === 'string'
    ) {
      return {
        kind: 'card',
        id: o.id,
        x: o.x,
        y: o.y,
        title: o.title,
        subtitle: o.subtitle,
        body: o.body,
      }
    }
  }
  return null
}

export function loadCanvasNodesFromStorage(): CanvasNode[] | null {
  try {
    const raw = localStorage.getItem(CANVAS_NODES_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data) || data.length === 0) return null
    const out: CanvasNode[] = []
    for (const row of data) {
      if (!row || typeof row !== 'object') return null
      const parsed = parseStoredCanvasNode(row as Record<string, unknown>)
      if (!parsed) return null
      out.push(parsed)
    }
    return out
  } catch {
    return null
  }
}

export function persistCanvasNodesToStorage(nodes: CanvasNode[]) {
  try {
    localStorage.setItem(CANVAS_NODES_STORAGE_KEY, JSON.stringify(nodes))
  } catch {
    /* quota / private mode */
  }
}

/**
 * Catalog ids for blocks on the saved canvas board.
 * - `null`: no snapshot (key missing or invalid) — do not hide catalog rows from storage.
 * - `[]`: empty board array was saved (callers must not treat this as “prune everything”).
 * - `postPruneCanvasCatalog` is not called automatically from the canvas surface (see publish workflow / catalog UI for cleanup).
 */
export function getCanvasCatalogKeepIdsFromLocalStorage(): string[] | null {
  try {
    const raw = localStorage.getItem(CANVAS_NODES_STORAGE_KEY)
    if (raw == null) return null
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return null
    if (data.length === 0) return []
    const out: string[] = []
    for (const row of data) {
      if (!row || typeof row !== 'object') return null
      const parsed = parseStoredCanvasNode(row as Record<string, unknown>)
      if (!parsed) return null
      out.push(componentCatalogIdForCanvasNode(parsed))
    }
    return out
  } catch {
    return null
  }
}
