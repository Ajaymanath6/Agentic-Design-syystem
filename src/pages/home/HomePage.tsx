import { MagnifyingGlass } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { CatalogDetailModal } from '../../components/catalog/CatalogDetailModal'
import { useCatalogCards } from '../../hooks/useCatalogCards'
import { isCatalogLayoutEntry } from '../../lib/catalog-layout-entry'
import { useCatalogSidebarCollapse } from '../../context/CatalogSidebarCollapseContext'
import type { CatalogCardModel } from '../../types/catalog'
import { HomeLibraryCardGrid } from './HomeLibraryCardGrid'
import { HOME_SECTION_BODY_GAP, HOME_SECTION_TOP, HOME_CARD_GRID_GAP, CATALOG_PAGE_TOOLBAR_BUTTON, HOME_PAGE_SHELL, HOME_PAGE_SHELL_COLLAPSED } from './home-layout'

const HOME_TOOLBAR_BUTTON = CATALOG_PAGE_TOOLBAR_BUTTON

const COMPONENT_DESCRIPTION_FALLBACK =
  'Published blocks from your catalog — browse and reuse in your projects.'

const PAGE_DESCRIPTION_FALLBACK =
  'Layout shells and full-page templates ready to open or extend.'

function HomeSectionHeading({
  id,
  title,
  subtitle,
}: {
  id?: string
  title: string
  subtitle: string
}) {
  return (
    <header className="border-b border-brandcolor-strokeweak pb-4">
      <div className="min-w-0 flex flex-col gap-1">
        <h2
          id={id}
          className="font-geist text-[20px] font-semibold leading-tight text-brandcolor-textstrong [font-family:var(--font-geist-stack)]"
        >
          {title}
        </h2>
        <p className="font-geist text-[14px] leading-snug text-brandcolor-textweak [font-family:var(--font-geist-stack)]">
          {subtitle}
        </p>
      </div>
    </header>
  )
}

/** Placeholder tiles until layouts are published from the admin Layout workspace. */
const PLACEHOLDER_UI_PAGES: { id: string; title: string; hint: string }[] = [
  { id: 'p1', title: 'Dashboard shell', hint: 'Placeholder layout shell' },
  { id: 'p2', title: 'Marketing hero + grid', hint: 'Placeholder layout shell' },
  { id: 'p3', title: 'Settings layout', hint: 'Placeholder layout shell' },
  { id: 'p4', title: 'Auth flow', hint: 'Placeholder layout shell' },
]

export function HomePage() {
  const { cards, loading, error } = useCatalogCards()
  const componentCards = useMemo(
    () => cards.filter((c) => !isCatalogLayoutEntry(c.entry)),
    [cards],
  )
  const pageCards = useMemo(
    () => cards.filter((c) => isCatalogLayoutEntry(c.entry)),
    [cards],
  )
  const [selected, setSelected] = useState<CatalogCardModel | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [librarySearch, setLibrarySearch] = useState('')
  const [componentsExpanded, setComponentsExpanded] = useState(false)
  const [pagesExpanded, setPagesExpanded] = useState(false)

  const selectedId = selected?.entry.id
  const modalCard = useMemo(() => {
    if (!modalOpen || !selectedId) return selected
    return cards.find((c) => c.entry.id === selectedId) ?? selected
  }, [modalOpen, selectedId, cards, selected])

  const { collapsed: sidebarCollapsed } = useCatalogSidebarCollapse()

  const openCard = (card: CatalogCardModel) => {
    setSelected(card)
    setModalOpen(true)
  }

  return (
    <div
      className={`${
        sidebarCollapsed ? HOME_PAGE_SHELL_COLLAPSED : HOME_PAGE_SHELL
      } min-w-0 overflow-x-hidden font-geist`}
    >
      <div className="my-10 flex items-center justify-between gap-4">
        <h1 className="font-geist text-[32px] font-semibold leading-tight text-brandcolor-textstrong [font-family:var(--font-geist-stack)]">
          Library
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className={HOME_TOOLBAR_BUTTON}>
            Import
          </button>
          <button type="button" className={HOME_TOOLBAR_BUTTON}>
            Integrations
          </button>
          
        </div>
      </div>

      <hr className="border-0 border-t border-brandcolor-strokeweak" />

      <div className="pt-10">
        <label htmlFor="home-library-search" className="sr-only">
          Search library
        </label>
        <div className="flex w-full items-center gap-3 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-4 py-3">
          <MagnifyingGlass
            size={20}
            weight="duotone"
            className="shrink-0 text-brandcolor-textweak"
            aria-hidden
          />
          <input
            id="home-library-search"
            type="search"
            name="librarySearch"
            autoComplete="off"
            placeholder="Search library…"
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 font-geist text-[14px] text-brandcolor-textstrong outline-none ring-0 placeholder:text-brandcolor-textweak focus:ring-0"
          />
        </div>
      </div>

      <div className={HOME_SECTION_TOP}>
        <HomeSectionHeading
          title="UI components"
          subtitle={COMPONENT_DESCRIPTION_FALLBACK}
        />
      </div>

      <div className={HOME_SECTION_BODY_GAP}>
        {loading && (
          <p className="mt-4 font-geist text-sm text-brandcolor-textweak">
            Loading catalog…
          </p>
        )}
        {error && (
          <p className="mt-4 font-geist text-sm text-brandcolor-destructive">
            {error}
          </p>
        )}

        {!loading && !error && componentCards.length === 0 ? (
          <p className="mt-4 font-geist text-sm text-brandcolor-textweak">
            No published components yet. Open the canvas and publish a block to
            see it here.
          </p>
        ) : null}

        {!loading && !error && componentCards.length > 0 ? (
          <HomeLibraryCardGrid
            cards={componentCards}
            sidebarCollapsed={sidebarCollapsed}
            expanded={componentsExpanded}
            onExpand={() => setComponentsExpanded(true)}
            onCollapse={() => setComponentsExpanded(false)}
            onOpenCard={openCard}
            ariaLabel="UI components"
            descriptionFallback={COMPONENT_DESCRIPTION_FALLBACK}
          />
        ) : null}
      </div>

      <section
        className={`${HOME_SECTION_TOP} min-w-0 max-w-full overflow-x-hidden`}
        aria-labelledby="home-ui-pages-heading"
      >
        <HomeSectionHeading
          id="home-ui-pages-heading"
          title="UI pages"
          subtitle={PAGE_DESCRIPTION_FALLBACK}
        />
        <div className={HOME_SECTION_BODY_GAP}>
          {!loading && !error && pageCards.length > 0 ? (
            <HomeLibraryCardGrid
              cards={pageCards}
              sidebarCollapsed={sidebarCollapsed}
              expanded={pagesExpanded}
              onExpand={() => setPagesExpanded(true)}
              onCollapse={() => setPagesExpanded(false)}
              onOpenCard={openCard}
              ariaLabel="UI pages"
              descriptionFallback={PAGE_DESCRIPTION_FALLBACK}
              preferSourceHtml={false}
            />
          ) : null}

          {!loading && !error && pageCards.length === 0 ? (
            <ul
              className={`grid w-full ${HOME_CARD_GRID_GAP} ${
                sidebarCollapsed ? 'grid-cols-4' : 'grid-cols-3'
              }`}
              role="list"
              aria-label="UI page ideas"
            >
              {PLACEHOLDER_UI_PAGES.map((page) => (
                <li
                  key={page.id}
                  className="flex min-w-0 flex-col rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white p-4"
                >
                  <span className="inline-flex max-w-full self-start truncate rounded-md border border-brandcolor-strokeweak bg-brandcolor-fill px-2 py-0.5 font-geist text-[11px] font-medium leading-snug text-brandcolor-textstrong [font-family:var(--font-geist-stack)]">
                    {page.title}
                  </span>
                  <div className="mt-4 flex aspect-[278/209] w-full items-center justify-center overflow-hidden rounded-md border border-brandcolor-strokeweak bg-brandcolor-fill font-geist text-[13px] text-brandcolor-textweak">
                    {page.hint}
                  </div>
                  <p className="mt-4 truncate font-geist text-[13px] leading-snug text-brandcolor-textweak">
                    {PAGE_DESCRIPTION_FALLBACK}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <CatalogDetailModal
        open={modalOpen}
        card={modalCard}
        onClose={() => {
          setModalOpen(false)
          setSelected(null)
        }}
      />
    </div>
  )
}
