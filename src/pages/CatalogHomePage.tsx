import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { CatalogDetailModal } from '../components/catalog/CatalogDetailModal'
import { useCatalogRefresh } from '../context/CatalogRefreshContext'
import {
  fetchBlueprintJson,
  fetchCatalogIndex,
} from '../services/catalog-reader'
import type { CatalogCardModel } from '../types/catalog'

export function CatalogHomePage() {
  const { catalogVersion } = useCatalogRefresh()
  const [cards, setCards] = useState<CatalogCardModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<CatalogCardModel | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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

  const openCard = (card: CatalogCardModel) => {
    setSelected(card)
    setModalOpen(true)
  }

  return (
    <div>
      <h1 className="font-sans text-3xl font-semibold tracking-tight text-brandcolor-textstrong c_md:text-4xl">
        Ready-to-use components
      </h1>
      <p className="mt-2 max-w-2xl text-brandcolor-textweak">
        Find everything you have published from the admin canvas—blueprints and
        thumbnails under{' '}
        <code className="text-brandcolor-textstrong">/blueprints/</code>. Open
        a card for code, JSON, and preview. To publish more blocks locally, run{' '}
        <code className="text-brandcolor-textstrong">npm run dev</code> (starts
        Vite and the publish helper).
      </p>

      {loading && (
        <p className="mt-8 text-sm text-brandcolor-textweak">Loading catalog…</p>
      )}
      {error && (
        <p className="mt-8 text-sm text-brandcolor-destructive">{error}</p>
      )}
      {!loading && !error && cards.length === 0 && (
        <Card className="mt-8 p-6">
          <p className="text-sm text-brandcolor-textweak">
            No published components yet. Open the canvas, capture a thumbnail,
            and publish a block to see it here.
          </p>
        </Card>
      )}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 c_xl:grid-cols-3">
        {cards.map((card) => {
          const thumb =
            card.entry.thumbnailPath || card.blueprint?.data?.imageUrl || ''
          const title =
            card.blueprint?.data?.imageAlt ||
            card.entry.importId ||
            card.entry.id
          return (
            <li key={card.entry.id}>
              <button
                type="button"
                onClick={() => openCard(card)}
                className="w-full text-left"
              >
                <Card className="overflow-hidden p-0 transition-shadow hover:shadow-tab-option">
                  <div className="aspect-video bg-brandcolor-fill">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-brandcolor-textweak">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-sans text-lg font-semibold text-brandcolor-textstrong">
                      {title}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-brandcolor-textweak">
                      {card.entry.id}
                    </p>
                  </div>
                </Card>
              </button>
            </li>
          )
        })}
      </ul>

      <CatalogDetailModal
        open={modalOpen}
        card={selected}
        onClose={() => {
          setModalOpen(false)
          setSelected(null)
        }}
      />
    </div>
  )
}
