/**
 * Mirrors FastAPI canvas plan JSON (`POST /canvas/plan`). No `id` — client assigns UUIDs.
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

export type CanvasPlanNodeSpec =
  | CanvasPlanCardNode
  | CanvasPlanButtonNode
  | CanvasPlanInputNode

export type CanvasPlanV1 = {
  version: 1
  nodes: CanvasPlanNodeSpec[]
}

const BUTTON_KINDS = new Set([
  'primaryButton',
  'secondaryButton',
  'neutralButton',
])

const INPUT_KINDS = new Set(['confirmPasswordInput', 'textInputField'])

export function isCanvasPlanV1(v: unknown): v is CanvasPlanV1 {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (o.version !== 1) return false
  if (!Array.isArray(o.nodes) || o.nodes.length === 0) return false
  for (const n of o.nodes) {
    if (!n || typeof n !== 'object') return false
    const row = n as Record<string, unknown>
    const kind = row.kind
    if (typeof kind !== 'string') return false
    if (kind === 'card') {
      if (typeof row.title !== 'string') return false
      if (typeof row.subtitle !== 'string') return false
      if (typeof row.body !== 'string') return false
      continue
    }
    if (BUTTON_KINDS.has(kind)) {
      if (typeof row.label !== 'string') return false
      continue
    }
    if (INPUT_KINDS.has(kind)) {
      if (typeof row.label !== 'string') return false
      continue
    }
    return false
  }
  return true
}
