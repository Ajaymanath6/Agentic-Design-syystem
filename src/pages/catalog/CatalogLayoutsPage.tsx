import { useEffect, useMemo, useState } from 'react'
import { CatalogDetailModal } from '../../components/catalog/CatalogDetailModal'
import { useCatalogCards } from '../../hooks/useCatalogCards'
import { catalogCardDisplayName } from '../../lib/catalog-display-name'
import { isCatalogLayoutEntry } from '../../lib/catalog-layout-entry'
import type { CatalogCardModel } from '../../types/catalog'

/**
 * Grid of published layouts (Admin Layout workspace → Code → Publish).
 */
export function CatalogLayoutsPage() {
  const { cards, loading, error } = useCatalogCards()
  const layoutCards = useMemo(
    () => cards.filter((c) => isCatalogLayoutEntry(c.entry)),
    [cards],
  )
  const [selected, setSelected] = useState<CatalogCardModel | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const selectedId = selected?.entry.id
  useEffect(() => {
    if (!modalOpen || !selectedId) return
    const updated = layoutCards.find((c) => c.entry.id === selectedId)
    if (updated) setSelected(updated)
  }, [layoutCards, modalOpen, selectedId])

  const openCard = (card: CatalogCardModel) => {
    setSelected(card)
    setModalOpen(true)
  }

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden px-4 pb-10">
      <p className="mt-6 border-b border-brandcolor-strokeweak pb-4 text-sm text-brandcolor-textweak">
        {!loading && !error
          ? `${layoutCards.length} published layout${layoutCards.length === 1 ? '' : 's'}`
          : 'Published layouts'}
      </p>

      {loading && (
        <p className="mt-6 text-sm text-brandcolor-textweak">Loading catalog…</p>
      )}
      {error && (
        <p className="mt-6 text-sm text-brandcolor-destructive">{error}</p>
      )}

      {!loading && !error && layoutCards.length === 0 ? (
        <p className="mt-6 text-sm text-brandcolor-textweak">
          No layouts published yet. In Admin → Layout, open structured preview
          Code, then Publish to capture and add a layout here.
        </p>
      ) : null}

      {!loading && !error && layoutCards.length > 0 ? (
        <ul
          className="mt-6 grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
          aria-label="Published layouts"
        >
          {layoutCards.map((card) => {
            const thumb =
              card.entry.thumbnailPath || card.blueprint?.data?.imageUrl || ''
            const name = catalogCardDisplayName(card)
            return (
              <li key={card.entry.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => openCard(card)}
                  title={name}
                  aria-label={`View ${name}`}
                  className="group/tile flex w-full min-w-0 flex-col rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white px-4 pb-4 pt-4 text-left shadow-card transition-[padding,box-shadow] duration-200 ease-out hover:shadow-md group-hover/tile:pt-2 group-focus-within/tile:pt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[278/209] w-full overflow-hidden rounded-md bg-brandcolor-fill">
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
                  <div className="flex h-8 shrink-0 items-center justify-center px-1 pt-1">
                    <p
                      className="max-w-full truncate text-center text-sm font-medium text-brandcolor-textstrong opacity-0 transition-opacity duration-200 ease-out group-hover/tile:opacity-100 group-focus-within/tile:opacity-100"
                      title={name}
                      aria-hidden
                    >
                      {name}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
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
