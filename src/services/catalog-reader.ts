import type {
  BlueprintDocument,
  CatalogIndexFile,
} from '../types/catalog'

function cacheBustUrl(path: string, bust: number) {
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}t=${bust}`
}

export async function fetchCatalogIndex(
  bust: number,
): Promise<CatalogIndexFile> {
  const res = await fetch(cacheBustUrl('/blueprints/_catalog.json', bust))
  if (!res.ok) throw new Error(`Catalog index failed: ${res.status}`)
  return res.json() as Promise<CatalogIndexFile>
}

export async function fetchBlueprintJson(
  blueprintPath: string,
  bust: number,
): Promise<BlueprintDocument> {
  const res = await fetch(cacheBustUrl(blueprintPath, bust))
  if (!res.ok) throw new Error(`Blueprint failed: ${res.status}`)
  return res.json() as Promise<BlueprintDocument>
}
