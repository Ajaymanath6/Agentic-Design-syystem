/**
 * Vertex sometimes puts the full user prompt in `label` for buttons/fields.
 * Coerce to short visible text for canvas UI, publish modal, and catalog title.
 */
const MAX_LABEL = 200
const SOFT_MAX = 56

/** User-style instructions often stay under SOFT_MAX chars; still shorten for publish UI. */
const VERB_RE =
  /\b(create|creat|creata|add|make|build|generate|design|implement)\b/i

/**
 * If the string looks like "…object… with/as …spec…", keep only the head before ` with ` / ` as `
 * (when the head is long enough to be a phrase, not e.g. "Save with care").
 */
function stripInstructionTail(t: string): string | null {
  const wm = t.match(/^(.+?)\s+with\s+/i)
  if (wm?.[1]) {
    const head = wm[1].trim()
    if (
      head.length >= 10 &&
      head.length < t.length - 5 &&
      (VERB_RE.test(t) || head.split(/\s+/).length >= 3)
    ) {
      return head
    }
  }
  const am = t.match(/^(.+?)\s+as\s+/i)
  if (am?.[1]) {
    const head = am[1].trim()
    if (
      head.length >= 10 &&
      head.length < t.length - 4 &&
      (VERB_RE.test(t) || head.split(/\s+/).length >= 3)
    ) {
      return head
    }
  }
  return null
}

function looksLikeInstructionPrompt(t: string): boolean {
  const words = t.split(/\s+/).filter(Boolean)
  /** Short real labels (e.g. "Create flow", "Add row") must not be forced through truncation. */
  if (t.length <= 24 && words.length <= 3) {
    return false
  }
  if (VERB_RE.test(t) && (t.length > 22 || words.length >= 4)) {
    return true
  }
  if (words.length >= 8) return true
  if (words.length >= 5 && /\b(with|using|background|colour|color)\b/i.test(t)) {
    return true
  }
  return false
}

const LEADING_DETERMINER_RE = /^(a|an|the|new)$/i

function firstWordMatchesVerb(w: string): boolean {
  return VERB_RE.test(w)
}

/**
 * Short catalog / Publish modal title: one meaningful word when the text looks like a
 * user prompt (verbs, long instructions, ellipsis cut). Skips leading verb + articles
 * + “new” so “creata an new buuton …” → “buuton”. Non-prompt short labels stay as-is.
 */
export function coerceCanvasPublishTitle(raw: string): string {
  const base = coerceCanvasControlLabel(raw)
  const baseClean = base.replace(/…+$/u, '').trim()
  const words = baseClean.split(/\s+/).filter(Boolean)
  if (words.length <= 1) {
    return baseClean.length > 0 ? baseClean : base
  }

  const shouldShorten =
    VERB_RE.test(raw) ||
    looksLikeInstructionPrompt(raw) ||
    base.endsWith('…') ||
    VERB_RE.test(baseClean) ||
    looksLikeInstructionPrompt(baseClean)

  if (!shouldShorten) {
    return base
  }

  let w = [...words]
  if (w.length > 0 && firstWordMatchesVerb(w[0]!)) {
    w = w.slice(1)
  }
  while (w.length > 0 && LEADING_DETERMINER_RE.test(w[0]!)) {
    w.shift()
  }
  if (w.length > 0 && w[0]!.toLowerCase() === 'new') {
    w = w.slice(1)
  }

  if (w.length >= 1) {
    return w[0]!
  }
  const fallback =
    words.find((x) => !firstWordMatchesVerb(x) && !LEADING_DETERMINER_RE.test(x)) ??
    words[words.length - 1] ??
    baseClean
  return fallback
}

export function coerceCanvasControlLabel(raw: string): string {
  const t = raw
    .trim()
    .normalize('NFC')
    .replace(/\u00a0/g, ' ')
  if (t.length === 0) return t

  const tailStripped = stripInstructionTail(t)
  if (tailStripped != null) {
    return coerceCanvasControlLabel(tailStripped)
  }

  if (t.length <= SOFT_MAX && !looksLikeInstructionPrompt(t)) {
    return t.slice(0, MAX_LABEL)
  }

  const named = t.match(
    /(?:name|naem|call|label)\s+it\s+["']?([^"'\n,.;]{2,56})/i,
  )
  if (named?.[1]) return named[1].trim().slice(0, MAX_LABEL)

  const labelIs = t.match(
    /(?:^|[\s,])(?:label|title|text)\s*(?:is|=|:)\s*["']?([^"'\n,.;]{2,56})/i,
  )
  if (labelIs?.[1]) return labelIs[1].trim().slice(0, MAX_LABEL)

  const quoted = t.match(/["']([^"'\n]{2,48})["']/)
  if (quoted?.[1]) return quoted[1].trim().slice(0, MAX_LABEL)

  const firstSentence = t.split(/[.?!]\s+/)[0]?.trim() ?? t
  if (
    firstSentence.length >= 2 &&
    firstSentence.length < t.length &&
    firstSentence.length <= SOFT_MAX + 12
  ) {
    return firstSentence.slice(0, MAX_LABEL)
  }

  const cut = t.slice(0, SOFT_MAX).trim()
  const lastSpace = cut.lastIndexOf(' ')
  const wordish =
    lastSpace > 20 ? cut.slice(0, lastSpace) : cut
  return `${wordish}…`
}
