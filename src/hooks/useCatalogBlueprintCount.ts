import { useEffect, useState } from 'react'
import { useCatalogRefresh } from '../context/CatalogRefreshContext'
import { fetchCatalogIndex } from '../services/catalog-reader'

/** Count of catalog entries that have a blueprint (for sidebar “All”). */
export function useCatalogBlueprintCount() {
  const { catalogVersion } = useCatalogRefresh()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const index = await fetchCatalogIndex(catalogVersion)
        const n = index.components.filter((c) => c.hasBlueprint).length
        if (!cancelled) setCount(n)
      } catch {
        if (!cancelled) setCount(0)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [catalogVersion])

  return count
}
