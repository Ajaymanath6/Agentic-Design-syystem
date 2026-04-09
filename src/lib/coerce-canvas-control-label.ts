/**
 * Vertex sometimes puts the full user prompt in `label` for buttons/fields.
 * Coerce to short visible text for canvas UI, publish modal, and catalog title.
 */
const MAX_LABEL = 200
const SOFT_MAX = 56

export function coerceCanvasControlLabel(raw: string): string {
  const t = raw
    .trim()
    .normalize('NFC')
    .replace(/\u00a0/g, ' ')
  if (t.length === 0) return t
  if (t.length <= SOFT_MAX) return t.slice(0, MAX_LABEL)

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
