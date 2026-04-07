const BOOKMARKS_KEY = 'catalog-component-bookmarks'

function parseList(raw: string | null): string[] {
  if (!raw) return []
  try {
    const p = JSON.parse(raw) as unknown
    return Array.isArray(p)
      ? p.filter((x): x is string => typeof x === 'string')
      : []
  } catch {
    return []
  }
}

export function isCatalogBookmarked(componentId: string): boolean {
  try {
    return parseList(localStorage.getItem(BOOKMARKS_KEY)).includes(componentId)
  } catch {
    return false
  }
}

export function toggleCatalogBookmark(componentId: string): boolean {
  try {
    const list = parseList(localStorage.getItem(BOOKMARKS_KEY))
    const next = new Set(list)
    if (next.has(componentId)) {
      next.delete(componentId)
    } else {
      next.add(componentId)
    }
    const arr = [...next]
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(arr))
    return next.has(componentId)
  } catch {
    return false
  }
}
