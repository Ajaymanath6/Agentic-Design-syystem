import { useEffect, useState } from 'react'
import { useCatalogRefresh } from '../context/CatalogRefreshContext'
import {
  fetchBlueprintJson,
  fetchCatalogIndex,
} from '../services/catalog-reader'
import type { CatalogCardModel } from '../types/catalog'

/**
 * Loads every catalog row that has a blueprint. We do **not** hide `canvas-*` rows when the
 * current components-canvas board omits them — that cross-filter caused Published badges to flip
 * when board state and `_catalog.json` disagreed for a moment. Orphans are removed by
 * Block removal uses `postDeleteComponent` from the canvas UI; catalog pruning is not tied to every board sync.
 */
export function useCatalogCards() {
  const { catalogVersion } = useCatalogRefresh()
  const [cards, setCards] = useState<CatalogCardModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const index = await fetchCatalogIndex(catalogVersion)
        const withBlueprint = index.components.filter((c) => c.hasBlueprint)
        const seenIds = new Set<string>()
        const uniqueById = withBlueprint.filter((c) => {
          if (seenIds.has(c.id)) return false
          seenIds.add(c.id)
          return true
        })
        const bust = catalogVersion
        const loaded = await Promise.all(
          uniqueById.map(async (entry) => {
            try {
              const blueprint = await fetchBlueprintJson(
                entry.blueprintPath,
                bust,
              )
              return { entry, blueprint } satisfies CatalogCardModel
            } catch (e) {
              return {
                entry,
                blueprint: null,
                loadError:
                  e instanceof Error ? e.message : 'Failed to load blueprint',
              } satisfies CatalogCardModel
            }
          }),
        )
        if (!cancelled) setCards(loaded)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
          /** Keep prior cards so Published badges do not flip to “not published” on a failed refetch. */
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [catalogVersion])

  return { cards, loading, error, catalogVersion }
}
