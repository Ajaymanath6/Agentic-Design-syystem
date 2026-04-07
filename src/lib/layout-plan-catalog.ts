import type { CatalogCardModel } from '../types/catalog'

/** Build allowlist strings for POST /layout/plan (ids, importIds, blueprint component names). */
export function buildCatalogAllowlist(cards: CatalogCardModel[]): string[] {
  const seen = new Set<string>()
  const add = (v: string | undefined | null) => {
    const t = v?.trim()
    if (t) seen.add(t)
  }
  for (const c of cards) {
    add(c.entry.id)
    add(c.entry.importId)
    if (c.blueprint?.component != null) {
      add(String(c.blueprint.component))
    }
  }
  return [...seen]
}

function normRef(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '')
}

function stripComponentSuffix(s: string): string {
  const low = s.toLowerCase()
  if (low.endsWith('component')) {
    return s.slice(0, -'component'.length).replace(/-+$/g, '')
  }
  return s
}

/** Match server-resolved `ref` to a published catalog card. */
export function findCardByPlanRef(
  canonicalRef: string,
  cards: CatalogCardModel[],
): CatalogCardModel | null {
  const r = normRef(canonicalRef)
  const rBase = stripComponentSuffix(r)
  for (const card of cards) {
    const candidates = [
      card.entry.id,
      card.entry.importId,
      card.blueprint?.component != null
        ? String(card.blueprint.component)
        : '',
    ].filter(Boolean) as string[]
    for (const raw of candidates) {
      const a = normRef(raw)
      const aBase = stripComponentSuffix(a)
      if (r === a || rBase === aBase) return card
      if (rBase && (rBase.includes(a) || a.includes(rBase))) return card
      if (r && (r.includes(a) || a.includes(r))) return card
    }
  }
  return null
}
