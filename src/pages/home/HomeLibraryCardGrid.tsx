import { CaretDown, CaretUp } from '@phosphor-icons/react'
import { CatalogSourceHtmlPreview } from '../../components/catalog/CatalogSourceHtmlPreview'
import {
  catalogCardDescription,
  catalogCardDisplayName,
  truncateCatalogCardDescription,
} from '../../lib/catalog-display-name'
import { catalogCardSourceHtml } from '../../lib/catalog-source-html'
import type { CatalogCardModel } from '../../types/catalog'
import { HOME_DIVIDER_GAP, HOME_SEE_MORE_BUTTON, HOME_CARD_GRID_GAP } from './home-layout'

const HOME_CARD_BADGE =
  'inline-flex max-w-full self-start truncate rounded-md border border-brandcolor-strokeweak bg-brandcolor-fill px-2 py-0.5 font-geist text-[11px] font-medium leading-snug text-brandcolor-textstrong [font-family:var(--font-geist-stack)]'

const HOME_PREVIEW_ROWS = 2

function gridColumnClass(sidebarCollapsed: boolean): string {
  return sidebarCollapsed ? 'grid-cols-4' : 'grid-cols-3'
}

function previewLimit(
  sidebarCollapsed: boolean,
  expanded: boolean,
  total: number,
): number {
  if (expanded) return total
  const cols = sidebarCollapsed ? 4 : 3
  return Math.min(total, cols * HOME_PREVIEW_ROWS)
}

type HomeLibraryCardProps = {
  card: CatalogCardModel
  descriptionFallback: string
  onOpen: (card: CatalogCardModel) => void
  preferSourceHtml?: boolean
}

function HomeLibraryCard({
  card,
  descriptionFallback,
  onOpen,
  preferSourceHtml = true,
}: HomeLibraryCardProps) {
  const name = catalogCardDisplayName(card)
  const fullDescription = catalogCardDescription(card, descriptionFallback)
  const description = truncateCatalogCardDescription(fullDescription)
  const sourceHtml = preferSourceHtml ? catalogCardSourceHtml(card) : null
  const thumb = card.entry.thumbnailPath || card.blueprint?.data?.imageUrl || ''

  return (
    <li className="flex min-w-0 flex-col rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white p-4">
      <button
        type="button"
        onClick={() => onOpen(card)}
        className="flex w-full flex-col items-stretch text-left font-geist [font-family:var(--font-geist-stack)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brandcolor-white"
      >
        <span className={HOME_CARD_BADGE}>{name}</span>
        <div className="mt-4 w-full overflow-hidden rounded-md border border-brandcolor-strokeweak bg-brandcolor-fill">
          <div className="aspect-[278/209] w-full">
            {sourceHtml ? (
              <CatalogSourceHtmlPreview
                html={sourceHtml}
                label={name}
                className="h-full w-full origin-top scale-[0.88] p-2"
              />
            ) : thumb ? (
              <img
                src={thumb}
                alt=""
                className="h-full w-full object-contain object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-geist text-[11px] text-brandcolor-textweak">
                No preview
              </div>
            )}
          </div>
        </div>
        <p
          className="mt-4 truncate font-geist text-[13px] leading-snug text-brandcolor-textweak"
          title={fullDescription}
        >
          {description}
        </p>
      </button>
    </li>
  )
}

function HomeExpandCollapseDivider({
  expanded,
  onToggle,
}: {
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className={HOME_DIVIDER_GAP}>
      <hr className="border-0 border-t border-brandcolor-strokeweak" />
      <div className={`${HOME_DIVIDER_GAP} flex justify-center`}>
        <button
          type="button"
          onClick={onToggle}
          className={HOME_SEE_MORE_BUTTON}
          aria-expanded={expanded}
        >
          {expanded ? 'See less' : 'See more'}
          {expanded ? (
            <CaretUp size={14} weight="duotone" aria-hidden />
          ) : (
            <CaretDown size={14} weight="duotone" aria-hidden />
          )}
        </button>
      </div>
    </div>
  )
}

type HomeLibraryCardGridProps = {
  cards: CatalogCardModel[]
  sidebarCollapsed: boolean
  expanded: boolean
  onExpand: () => void
  onCollapse: () => void
  onOpenCard: (card: CatalogCardModel) => void
  ariaLabel: string
  descriptionFallback: string
  preferSourceHtml?: boolean
}

export function HomeLibraryCardGrid({
  cards,
  sidebarCollapsed,
  expanded,
  onExpand,
  onCollapse,
  onOpenCard,
  ariaLabel,
  descriptionFallback,
  preferSourceHtml = true,
}: HomeLibraryCardGridProps) {
  const previewCount = previewLimit(sidebarCollapsed, false, cards.length)
  const firstBatch = cards.slice(0, previewCount)
  const restBatch = cards.slice(previewCount)
  const hasMore = restBatch.length > 0
  const gridClass = `grid w-full ${HOME_CARD_GRID_GAP} ${gridColumnClass(sidebarCollapsed)}`

  if (expanded || !hasMore) {
    return (
      <>
        <ul className={gridClass} role="list" aria-label={ariaLabel}>
          {(expanded ? cards : firstBatch).map((card) => (
            <HomeLibraryCard
              key={card.entry.id}
              card={card}
              descriptionFallback={descriptionFallback}
              onOpen={onOpenCard}
              preferSourceHtml={preferSourceHtml}
            />
          ))}
        </ul>
        {hasMore ? (
          <HomeExpandCollapseDivider
            expanded={expanded}
            onToggle={expanded ? onCollapse : onExpand}
          />
        ) : null}
      </>
    )
  }

  return (
    <>
      <ul className={gridClass} role="list" aria-label={ariaLabel}>
        {firstBatch.map((card) => (
          <HomeLibraryCard
            key={card.entry.id}
            card={card}
            descriptionFallback={descriptionFallback}
            onOpen={onOpenCard}
            preferSourceHtml={preferSourceHtml}
          />
        ))}
      </ul>
      <HomeExpandCollapseDivider expanded={false} onToggle={onExpand} />
    </>
  )
}
