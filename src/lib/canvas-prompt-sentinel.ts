/** Inline canvas ref markers embedded in the HTML-mode prompt string (not shown raw in the UI). */
const SENTINEL_RE =
  /\[\[canvas-ref:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]\]/gi

export function makeCanvasRefSentinel(id: string): string {
  return `[[canvas-ref:${id}]]`
}

/** First-seen order, deduped. */
export function parseOrderedCanvasRefIds(serialized: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const re = new RegExp(SENTINEL_RE.source, 'gi')
  let m: RegExpExecArray | null
  while ((m = re.exec(serialized)) !== null) {
    const id = m[1]!
    if (seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

export function stripCanvasRefSentinels(serialized: string): string {
  return serialized
    .replace(/\[\[canvas-ref:[^\]]+\]\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function removeFirstCanvasRefSentinel(
  serialized: string,
  id: string,
): string {
  const token = makeCanvasRefSentinel(id)
  const idx = serialized.indexOf(token)
  if (idx === -1) return serialized
  return (serialized.slice(0, idx) + serialized.slice(idx + token.length))
    .replace(/\s{2,}/g, ' ')
    .trimStart()
}
