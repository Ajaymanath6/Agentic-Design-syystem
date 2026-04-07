import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowRightSLine } from '@remixicon/react'
import { CatalogDetailModal } from '../../components/catalog/CatalogDetailModal'
import { useCatalogCards } from '../../hooks/useCatalogCards'
import type { CatalogCardModel } from '../../types/catalog'

/** Placeholder tiles until layouts are published from the admin Layout workspace. */
const PLACEHOLDER_UI_PAGES: { id: string; title: string; hint: string }[] = [
  { id: 'p1', title: 'Dashboard shell', hint: 'Placeholder' },
  { id: 'p2', title: 'Marketing hero + grid', hint: 'Placeholder' },
  { id: 'p3', title: 'Settings layout', hint: 'Placeholder' },
  { id: 'p4', title: 'Auth flow', hint: 'Placeholder' },
]

export function HomePage() {
  const { cards, loading, error } = useCatalogCards()
  const [selected, setSelected] = useState<CatalogCardModel | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const stripRef = useRef<HTMLUListElement>(null)

  const selectedId = selected?.entry.id
  useEffect(() => {
    if (!modalOpen || !selectedId) return
    const updated = cards.find((c) => c.entry.id === selectedId)
    if (updated) setSelected(updated)
  }, [cards, modalOpen, selectedId])

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
        <Link
          to="/catalog/all"
          className="text-sm text-brandcolor-textweak transition-colors hover:text-brandcolor-textstrong"
        >
          View all &gt;
        </Link>
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
                  className="group/col box-border flex h-[292px] w-[314px] min-w-[314px] shrink-0 flex-col bg-transparent px-5 pt-5 pb-5"
                >
                  <div className="flex min-h-0 flex-1 items-center justify-center">
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
                  </div>
                  <div className="flex h-8 shrink-0 items-center justify-center px-1">
                    <p
                      className="max-w-full truncate text-center text-xs text-brandcolor-textweak opacity-0 transition-opacity duration-150 group-hover/col:opacity-100 group-focus-within/col:opacity-100"
                      title={componentName}
                    >
                      {componentName}
                    </p>
                  </div>
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

      <section className="mt-14 min-w-0 max-w-full overflow-x-hidden" aria-labelledby="home-ui-pages-heading">
        <header className="mt-2 flex items-baseline justify-between gap-4 border-b border-brandcolor-strokeweak pb-4">
          <h2
            id="home-ui-pages-heading"
            className="font-sans text-xl font-semibold text-brandcolor-textstrong"
          >
            UI pages
          </h2>
          <Link
            to="/catalog/layouts"
            className="text-sm text-brandcolor-textweak transition-colors hover:text-brandcolor-textstrong"
          >
            View all &gt;
          </Link>
        </header>
        <div className="relative min-w-0 max-w-full overflow-x-hidden pt-4">
          <ul
            className="flex max-w-full gap-6 overflow-x-auto overflow-y-hidden pb-2"
            role="list"
            aria-label="UI page placeholders"
          >
            {PLACEHOLDER_UI_PAGES.map((page) => (
              <li
                key={page.id}
                className="flex w-[calc((100%-3rem)/3)] min-w-[280px] max-w-[420px] shrink-0 flex-col"
              >
                <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-brandcolor-strokeweak bg-brandcolor-fill text-sm text-brandcolor-textweak">
                  {page.hint}
                </div>
                <p className="mt-3 truncate text-sm font-medium text-brandcolor-textstrong">
                  {page.title}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

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
