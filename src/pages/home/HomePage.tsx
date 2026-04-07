import { useCallback, useEffect, useRef, useState } from 'react'
import { RiArrowRightSLine } from '@remixicon/react'
import { CatalogDetailModal } from '../../components/catalog/CatalogDetailModal'
import { useCatalogRefresh } from '../../context/CatalogRefreshContext'
import {
  fetchBlueprintJson,
  fetchCatalogIndex,
} from '../../services/catalog-reader'
import type { CatalogCardModel } from '../../types/catalog'

export function HomePage() {
  const { catalogVersion } = useCatalogRefresh()
  const [cards, setCards] = useState<CatalogCardModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<CatalogCardModel | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const stripRef = useRef<HTMLUListElement>(null)

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

  const scrollStripForward = useCallback(() => {
    const el = stripRef.current
    if (!el) return
    el.scrollBy({ left: Math.min(314, el.clientWidth * 0.85), behavior: 'smooth' })
  }, [])

  const openCard = (card: CatalogCardModel) => {
    setSelected(card)
    setModalOpen(true)
  }

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden px-4">
      <header className="mt-6 flex items-baseline justify-between gap-4 border-b border-brandcolor-strokeweak pb-4">
        <h2 className="font-sans text-xl font-semibold text-brandcolor-textstrong">
          UI components
        </h2>
        <button
          type="button"
          className="text-sm text-brandcolor-textweak transition-colors hover:text-brandcolor-textstrong"
        >
          View all &gt;
        </button>
      </header>

      {loading && (
        <p className="mt-4 text-sm text-brandcolor-textweak">Loading catalog…</p>
      )}
      {error && (
        <p className="mt-4 text-sm text-brandcolor-destructive">{error}</p>
      )}

      {!loading && !error && cards.length === 0 ? (
        <p className="mt-4 text-sm text-brandcolor-textweak">
          No published components yet. Open the canvas, capture a thumbnail, and
          publish a block to see it here.
        </p>
      ) : null}

      {!loading && !error && cards.length > 0 ? (
        <div className="relative min-w-0 max-w-full overflow-x-hidden">
          <ul
            ref={stripRef}
            className="catalog-home-scroll-strip flex max-w-full divide-x divide-brandcolor-strokeweak overflow-x-auto overflow-y-hidden border border-brandcolor-strokeweak border-t-0"
          >
            {cards.map((card) => {
              const thumb =
                card.entry.thumbnailPath || card.blueprint?.data?.imageUrl || ''
              const componentName =
                card.entry.importId || card.entry.id
              return (
                <li
                  key={card.entry.id}
                  className="group/col box-border flex w-[314px] min-w-[314px] shrink-0 flex-col bg-transparent px-5 pt-5 pb-5 transition-[padding] duration-150 ease-out hover:pt-0 hover:pb-0 focus-within:pt-0 focus-within:pb-0"
                >
                  <button
                    type="button"
                    onClick={() => openCard(card)}
                    className="flex w-full items-center justify-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    <div className="h-[209px] w-[278px] shrink-0 overflow-hidden rounded-lg bg-transparent">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="h-full w-full object-contain object-center"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-brandcolor-textweak">
                          No image
                        </div>
                      )}
                    </div>
                  </button>
                  <p
                    className="hidden max-w-full truncate pt-1 text-center text-xs text-brandcolor-textweak group-hover/col:block group-focus-within/col:block"
                    title={componentName}
                  >
                    {componentName}
                  </p>
                </li>
              )
            })}
          </ul>
          {cards.length > 1 ? (
            <button
              type="button"
              aria-label="Scroll to next components"
              onClick={scrollStripForward}
              className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-brandcolor-strokeweak bg-brandcolor-fill text-brandcolor-textstrong shadow-card transition-colors hover:bg-brandcolor-neutralhover"
            >
              <RiArrowRightSLine className="size-5" aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}

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
