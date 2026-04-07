import type { CatalogCardModel } from '../types/catalog'

/** Max instances for flow layout (flex-wrap, “three cards”, etc.). */
export const LAYOUT_PREVIEW_MAX_FLOW_COUNT = 12

/** Max cells for grid layout (e.g. 4×4 = 16); separate from flow cap. */
export const LAYOUT_PREVIEW_MAX_GRID_CELLS = 36

/** Max columns or rows in a grid (prevents absurd templates). */
export const LAYOUT_PREVIEW_MAX_GRID_DIMENSION = 6

const WORD_TO_NUM: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
}

function clampFlowCount(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(LAYOUT_PREVIEW_MAX_FLOW_COUNT, Math.floor(n))
}

function clampGridDimensions(cols: number, rows: number): {
  cols: number
  rows: number
} {
  let c = Math.max(1, Math.min(LAYOUT_PREVIEW_MAX_GRID_DIMENSION, Math.floor(cols)))
  let r = Math.max(1, Math.min(LAYOUT_PREVIEW_MAX_GRID_DIMENSION, Math.floor(rows)))
  let cells = c * r
  while (cells > LAYOUT_PREVIEW_MAX_GRID_CELLS && c > 1) {
    c -= 1
    cells = c * r
  }
  while (cells > LAYOUT_PREVIEW_MAX_GRID_CELLS && r > 1) {
    r -= 1
    cells = c * r
  }
  return { cols: c, rows: r }
}

/**
 * Parse grid size from prompt. Convention: first number = **columns**, second = **rows**
 * (e.g. `4x4`, `4 by 4`, `grid 3 by 2`). Explicit “N columns M rows” overrides order.
 */
export function parseGridFromPrompt(prompt: string): {
  cols: number
  rows: number
} | null {
  const t = prompt.trim()

  let m = t.match(/\b(\d{1,2})\s+columns?\s+(\d{1,2})\s+rows?\b/i)
  if (m) {
    return clampGridDimensions(Number(m[1]), Number(m[2]))
  }

  m = t.match(/\b(\d{1,2})\s+rows?\s+(\d{1,2})\s+columns?\b/i)
  if (m) {
    return clampGridDimensions(Number(m[2]), Number(m[1]))
  }

  m = t.match(/\bgrid\s+of\s+(\d{1,2})\s+by\s+(\d{1,2})\b/i)
  if (m) {
    return clampGridDimensions(Number(m[1]), Number(m[2]))
  }

  m = t.match(/\b(\d{1,2})\s*[x×]\s*(\d{1,2})\b/)
  if (m) {
    return clampGridDimensions(Number(m[1]), Number(m[2]))
  }

  m = t.match(/\b(\d{1,2})\s+by\s+(\d{1,2})\b/i)
  if (m) {
    return clampGridDimensions(Number(m[1]), Number(m[2]))
  }

  return null
}

/** PascalCase / UpperCamelCase → kebab-case (e.g. CaseCardComponent → case-card-component). */
function pascalToKebab(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * Lowercase haystack including kebab forms of PascalCase tokens (e.g. CaseCardComponent).
 */
function buildMatchHaystack(raw: string): string {
  const lower = raw.toLowerCase()
  const pascal =
    raw.match(/\b[A-Z][a-zA-Z0-9]*(?:[A-Z][a-zA-Z0-9]*)+\b/g) || []
  const extra: string[] = [lower]
  for (const p of pascal) {
    extra.push(pascalToKebab(p))
    if (p.endsWith('Component') && p.length > 'Component'.length) {
      extra.push(pascalToKebab(p.slice(0, -'Component'.length)))
    }
  }
  return [...new Set(extra)].join(' ')
}

/**
 * Extract how many repeated instances the user asked for in **flow** mode (default 1).
 */
export function parseRepeatCount(prompt: string): number {
  const lower = prompt.toLowerCase()

  const digitWithCards = lower.match(
    /\b(\d{1,2})\s*(?:cards?|columns?|times|copies|instances?)\b/,
  )
  if (digitWithCards) {
    return clampFlowCount(Number(digitWithCards[1]))
  }

  const digitWithOf = lower.match(
    /\b(\d{1,2})\s*(?:×|x)\s*(?:the\s+)?(?:same\s+)?/,
  )
  if (digitWithOf) {
    return clampFlowCount(Number(digitWithOf[1]))
  }

  for (const [word, value] of Object.entries(WORD_TO_NUM)) {
    const re = new RegExp(`\\b${word}\\s+cards?\\b`, 'i')
    if (re.test(lower)) return clampFlowCount(value)
    const reCol = new RegExp(`\\b${word}\\s+columns?\\b`, 'i')
    if (reCol.test(lower)) return clampFlowCount(value)
  }

  const looseDigit = lower.match(/\b(\d{1,2})\s+cards?\b/)
  if (looseDigit) return clampFlowCount(Number(looseDigit[1]))

  const standalone = lower.match(/^\s*(\d{1,2})\s*$/)
  if (standalone) return clampFlowCount(Number(standalone[1]))

  return 1
}

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function squashSeparators(s: string): string {
  return s.toLowerCase().replace(/[-\s·_]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function scorePromptAgainstCard(
  matchHaystack: string,
  card: CatalogCardModel,
): number {
  const promptLower = matchHaystack
  let score = 0
  const promptSquashed = squashSeparators(promptLower)
  const importId = norm(card.entry.importId || '')
  const entryId = norm(card.entry.id || '')
  const bpImport =
    card.blueprint?.importId != null
      ? norm(String(card.blueprint.importId))
      : ''
  const bpComponent =
    card.blueprint?.component != null
      ? norm(String(card.blueprint.component))
      : ''
  const bpId = card.blueprint?.id != null ? norm(String(card.blueprint.id)) : ''

  const candidates = [importId, entryId, bpImport, bpComponent, bpId].filter(
    (x) => x.length >= 2,
  )

  for (const c of candidates) {
    if (!c) continue
    const cWords = squashSeparators(c.replace(/-/g, ' '))
    const cKebab = c
    if (promptLower === c) score += 120
    else if (promptLower.includes(c)) score += Math.min(80, 20 + c.length * 2)
    else if (c.includes(promptLower) && promptLower.length >= 4) score += 40
    else if (cWords.length >= 3 && promptSquashed.includes(cWords)) {
      score += Math.min(85, 30 + cWords.length * 2)
    }
    if (cKebab.length >= 3 && promptSquashed.includes(cKebab)) {
      score += 35
    }
  }

  const dotParts = promptLower.split('·').map((p) => p.trim())
  for (const part of dotParts) {
    if (part.length < 2) continue
    for (const c of candidates) {
      if (!c) continue
      if (part === c) score += 100
      else if (part.includes(c) || c.includes(part)) score += 55
    }
  }

  const kebabTokens = promptLower.match(/[a-z0-9]+(?:-[a-z0-9]+)+/g) || []
  for (const t of kebabTokens) {
    for (const c of candidates) {
      if (!c) continue
      if (t === c) score += 100
      else if (t.includes(c) || c.includes(t)) score += 45
    }
  }

  const desc = card.blueprint?.data?.description
  if (typeof desc === 'string') {
    const d = norm(desc.slice(0, 160))
    if (d.length >= 6 && promptLower.includes(d.slice(0, 20))) {
      score += 25
    }
  }

  return score
}

const MIN_MATCH_SCORE = 42

export type LayoutPreviewMode = 'flow' | 'grid'

export type ParseLayoutIntentResult = {
  /** Single catalog component to repeat; only catalog entries allowed. */
  template: CatalogCardModel | null
  count: number
  layoutMode: LayoutPreviewMode
  gridCols?: number
  gridRows?: number
  unmatchedReason?: string
}

/**
 * Parse the latest user prompt: optional **grid** (cols×rows), else **flow** repeat count,
 * plus best-matching published catalog card. Preview uses blueprint `sourceHtml` only (not JSX).
 */
export function parseLayoutIntentFromCatalog(
  prompt: string,
  catalog: CatalogCardModel[],
): ParseLayoutIntentResult {
  const trimmed = prompt.trim()
  const gridSpec = parseGridFromPrompt(trimmed)
  const flowCount = parseRepeatCount(trimmed)

  if (catalog.length === 0) {
    return {
      template: null,
      count: 1,
      layoutMode: 'flow',
      unmatchedReason: 'Catalog is empty. Publish components to the catalog first.',
    }
  }

  if (!trimmed) {
    return {
      template: null,
      count: 1,
      layoutMode: 'flow',
      unmatchedReason: 'Enter a prompt that names a catalog component.',
    }
  }

  const matchHaystack = buildMatchHaystack(trimmed)
  let best: CatalogCardModel | null = null
  let bestScore = 0

  for (const card of catalog) {
    const s = scorePromptAgainstCard(matchHaystack, card)
    if (s > bestScore) {
      bestScore = s
      best = card
    }
  }

  if (!best || bestScore < MIN_MATCH_SCORE) {
    return {
      template: null,
      count: gridSpec ? gridSpec.cols * gridSpec.rows : flowCount,
      layoutMode: gridSpec ? 'grid' : 'flow',
      gridCols: gridSpec?.cols,
      gridRows: gridSpec?.rows,
      unmatchedReason:
        'No catalog component matched. Try the inspect name or id (e.g. CaseCardComponent or case-card).',
    }
  }

  if (gridSpec) {
    const count = gridSpec.cols * gridSpec.rows
    return {
      template: best,
      count,
      layoutMode: 'grid',
      gridCols: gridSpec.cols,
      gridRows: gridSpec.rows,
    }
  }

  return {
    template: best,
    count: flowCount,
    layoutMode: 'flow',
  }
}
