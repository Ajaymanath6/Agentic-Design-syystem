import {
  componentCatalogIdForCanvasNode,
  type CanvasNode,
} from './canvas-node-publish'

export const CANVAS_NODES_STORAGE_KEY = 'agentic-components-canvas-nodes-v1'

/** Catalog ids produced from the components canvas world (publish / prune targets). */
export function isCanvasWorldCatalogId(id: string): boolean {
  return (
    typeof id === 'string' &&
    (id.startsWith('canvas-card-') ||
      id.startsWith('canvas-primary-') ||
      id.startsWith('canvas-secondary-') ||
      id.startsWith('canvas-neutral-') ||
      id.startsWith('canvas-confirm-password-') ||
      id.startsWith('canvas-text-field-'))
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
      label: o.label,
    }
  }
  if (o.kind === 'secondaryButton') {
    if (typeof o.label !== 'string') return null
    return {
      kind: 'secondaryButton',
      id: o.id,
      x: o.x,
      y: o.y,
      label: o.label,
    }
  }
  if (o.kind === 'neutralButton') {
    if (typeof o.label !== 'string') return null
    return {
      kind: 'neutralButton',
      id: o.id,
      x: o.x,
      y: o.y,
      label: o.label,
    }
  }
  if (o.kind === 'confirmPasswordInput') {
    if (typeof o.label !== 'string') return null
    return {
      kind: 'confirmPasswordInput',
      id: o.id,
      x: o.x,
      y: o.y,
      label: o.label,
    }
  }
  if (o.kind === 'textInputField') {
    if (typeof o.label !== 'string') return null
    return {
      kind: 'textInputField',
      id: o.id,
      x: o.x,
      y: o.y,
      label: o.label,
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
 * - non-empty: pass to `postPruneCanvasCatalog` only when intentional (e.g. canvas surface debounced prune).
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
