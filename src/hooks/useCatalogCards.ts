import { useEffect, useState } from 'react'
import { useCatalogRefresh } from '../context/CatalogRefreshContext'
import {
  fetchBlueprintJson,
  fetchCatalogIndex,
} from '../services/catalog-reader'
import type { CatalogCardModel } from '../types/catalog'

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
        const bust = catalogVersion
        const loaded = await Promise.all(
          withBlueprint.map(async (entry) => {
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
          setCards([])
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
