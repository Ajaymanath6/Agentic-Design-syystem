import { RiCodeSSlashLine, RiLoader4Line } from '@remixicon/react'
import { Fragment, type ReactNode, useMemo, useState } from 'react'
import { StructuredPreviewCodeModal } from '../../components/admin/StructuredPreviewCodeModal'
import { CatalogDetailToolbarButton } from '../../components/catalog/CatalogDetailToolbarButton'
import { useAdminWorkspace } from '../../context/AdminWorkspaceContext'
import { useCatalogCards } from '../../hooks/useCatalogCards'
import { findCardByPlanRef } from '../../lib/layout-plan-catalog'
import {
  rowColumnClass,
  rowOuterFlexClass,
  splitMainColumnClass,
  splitOuterFlexClass,
  splitSidebarWidthClass,
} from '../../lib/layout-row-split-classes'
import { buildStructuredPreviewHtml } from '../../lib/layout-structured-preview-code'
import {
  getMarginBottomClassForAfterGap,
  resolveLayoutAfterGap,
} from '../../lib/layout-spacing-resolve'
import { parseLayoutIntentFromCatalog } from '../../lib/layout-prompt-from-catalog'
import {
  getClassesForLayoutKey,
  isLayoutThemeKey,
} from '../../lib/theme-guide-resolve'
import type { CatalogCardModel } from '../../types/catalog'
import type { LayoutLeafBlock, LayoutPlanBlock } from '../../types/layout-plan'

/** Mirrors `componentGuidelines.card` in src/config/theme-guide.json */
const THEME_CARD_SURFACE =
  'rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white shadow-card'

function CatalogPreviewCells({
  instances,
  layoutMode,
  gridCols,
  gridRows,
}: {
  instances: { key: string; card: CatalogCardModel }[]
  layoutMode: 'flow' | 'grid'
  gridCols?: number
  gridRows?: number
}) {
  const isGrid =
    layoutMode === 'grid' &&
    gridCols != null &&
    gridRows != null &&
    gridCols > 0 &&
    gridRows > 0

  return (
    <div
      className={
        isGrid ? 'min-w-0' : 'flex min-w-0 flex-col gap-4'
      }
      style={
        isGrid
          ? {
              display: 'grid',
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              gap: '1rem',
            }
          : undefined
      }
    >
      {instances.map(({ key, card }) => {
        const html =
          card.blueprint?.data &&
          typeof card.blueprint.data.sourceHtml === 'string'
            ? card.blueprint.data.sourceHtml.trim()
            : ''
        const thumb =
          card.entry.thumbnailPath ||
          card.blueprint?.data?.imageUrl ||
          ''

        return (
          <div key={key} className="min-w-0 w-full max-w-full overflow-hidden">
            {html ? (
              <div
                className="layout-preview-html [&_*]:max-w-full"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : thumb ? (
              <img
                src={thumb}
                alt=""
                className="max-h-64 w-full object-contain object-center"
              />
            ) : (
              <p className="text-xs text-brandcolor-textweak">
                No preview HTML or image for this component.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function catalogStripProps(
  layoutMode: 'flow' | 'grid',
  grid: { cols: number; rows: number } | undefined,
): {
  layoutMode: 'flow' | 'grid'
  gridCols?: number
  gridRows?: number
} {
  if (layoutMode === 'grid' && grid) {
    return {
      layoutMode: 'grid',
      gridCols: grid.cols,
      gridRows: grid.rows,
    }
  }
  return { layoutMode: 'flow' }
}

function renderCatalogBlock(
  block: Extract<LayoutLeafBlock, { type: 'catalog' }>,
  cards: CatalogCardModel[],
  keyPrefix: string,
): ReactNode {
  const card = findCardByPlanRef(block.ref, cards)
  if (!card) {
    return (
      <p
        className="text-sm text-brandcolor-textweak"
        role="status"
        key={keyPrefix}
      >
        Could not resolve catalog ref &quot;{block.ref}&quot; in the loaded index.
      </p>
    )
  }

  const strip = Array.from({ length: block.repeat }, (_, j) => ({
    key: `${card.entry.id}-${keyPrefix}-${j}`,
    card,
  }))
  const { layoutMode, gridCols, gridRows } = catalogStripProps(
    block.layout,
    block.grid,
  )
  const a11yName =
    block.layout === 'grid' && block.grid != null
      ? `${block.grid.cols} by ${block.grid.rows} grid, ${block.repeat} cells, ${card.entry.importId || card.entry.id}`
      : `${block.repeat} × ${card.entry.importId || card.entry.id}`

  return (
    <div
      key={keyPrefix}
      className="min-w-0"
      aria-label={a11yName}
    >
      <CatalogPreviewCells
        instances={strip}
        layoutMode={layoutMode}
        gridCols={gridCols}
        gridRows={gridRows}
      />
    </div>
  )
}

function renderChromeBlock(
  block: Extract<LayoutLeafBlock, { type: 'chrome' }>,
  keyPrefix: string,
): ReactNode {
  const tk = isLayoutThemeKey(block.titleThemeKey)
    ? block.titleThemeKey
    : 'heading.h2'
  const sk =
    block.subtitle != null &&
    block.subtitleThemeKey != null &&
    isLayoutThemeKey(block.subtitleThemeKey)
      ? block.subtitleThemeKey
      : 'profileCard.title'
  return (
    <div key={keyPrefix} className="min-w-0">
      <div className="space-y-1">
        <h2 className={getClassesForLayoutKey(tk)}>{block.title}</h2>
        {block.subtitle ? (
          <p className={getClassesForLayoutKey(sk)}>{block.subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}

function renderLeafBlock(
  block: LayoutLeafBlock,
  cards: CatalogCardModel[],
  keyPrefix: string,
): ReactNode {
  if (block.type === 'chrome') {
    return renderChromeBlock(block, keyPrefix)
  }
  return renderCatalogBlock(block, cards, keyPrefix)
}

function renderLeafColumn(
  leaves: LayoutLeafBlock[],
  cards: CatalogCardModel[],
  keyPrefix: string,
): ReactNode {
  return (
    <div className={rowColumnClass()}>
      {leaves.map((leaf, j) => (
        <Fragment key={`${keyPrefix}-l${j}`}>
          {renderLeafBlock(leaf, cards, `${keyPrefix}-l${j}`)}
        </Fragment>
      ))}
    </div>
  )
}

function normalizeRowColumns(
  columns: { children: LayoutLeafBlock[] }[],
): LayoutLeafBlock[][] {
  const nonEmpty = columns
    .map((c) => c.children)
    .filter((ch) => ch.length > 0)
  const clamped = nonEmpty.slice(0, 4)
  return clamped
}

function renderPlanBlock(
  block: LayoutPlanBlock,
  cards: CatalogCardModel[],
  i: number,
  wrapClass: string,
): ReactNode {
  const key = `block-wrap-${i}`

  if (block.type === 'chrome' || block.type === 'catalog') {
    return (
      <div key={key} className={wrapClass}>
        {renderLeafBlock(block, cards, `${key}-leaf`)}
      </div>
    )
  }

  if (block.type === 'row') {
    const cols = normalizeRowColumns(block.columns)
    if (cols.length < 2) {
      const flat = cols.flat()
      return (
        <div key={key} className={wrapClass}>
          <div className="flex min-w-0 flex-col gap-4">
            {flat.map((leaf, j) => (
              <Fragment key={`${key}-f${j}`}>
                {renderLeafBlock(leaf, cards, `${key}-f${j}`)}
              </Fragment>
            ))}
          </div>
        </div>
      )
    }
    return (
      <div
        key={key}
        className={`${wrapClass} ${rowOuterFlexClass(block.stackBelow)}`}
        role="group"
        aria-label="Row layout"
      >
        {cols.map((leaves, ci) => (
          <Fragment key={`${key}-c${ci}`}>
            {renderLeafColumn(leaves, cards, `${key}-c${ci}`)}
          </Fragment>
        ))}
      </div>
    )
  }

  if (block.type === 'split') {
    const placementStart = block.sidebarPlacement !== 'end'
    const sidebarLeaves = block.sidebar
    const mainLeaves = block.main
    const sidebarCol = (
      <div
        role="group"
        aria-label="Sidebar"
        className={splitSidebarWidthClass(block.sidebarWidth)}
      >
        {sidebarLeaves.length > 0 ? (
          renderLeafColumn(sidebarLeaves, cards, `${key}-side`)
        ) : null}
      </div>
    )
    const mainCol = (
      <div role="group" aria-label="Main content" className={splitMainColumnClass()}>
        {mainLeaves.length > 0 ? (
          renderLeafColumn(mainLeaves, cards, `${key}-main`)
        ) : null}
      </div>
    )
    return (
      <div
        key={key}
        className={`${wrapClass} ${splitOuterFlexClass()}`}
        role="group"
        aria-label="Sidebar and main layout"
      >
        {placementStart ? (
          <>
            {sidebarCol}
            {mainCol}
          </>
        ) : (
          <>
            {mainCol}
            {sidebarCol}
          </>
        )}
      </div>
    )
  }

  return (
    <div key={key} className={wrapClass} role="status">
      <p className="text-sm text-brandcolor-textweak">
        Unsupported block type in layout plan.
      </p>
    </div>
  )
}

/**
 * Layout workspace main pane: instant heuristic preview, then structured plan
 * (theme-guide chrome + catalog sourceHtml) when POST /layout/plan succeeds.
 */
export function AdminLayoutStudio() {
  const { layoutPromptEntries, layoutPlan, layoutPlanBusy, layoutPlanError } =
    useAdminWorkspace()
  const { cards, loading, error } = useCatalogCards()
  const [structuredCodeOpen, setStructuredCodeOpen] = useState(false)

  const lastPrompt =
    layoutPromptEntries.length > 0
      ? layoutPromptEntries[layoutPromptEntries.length - 1]
      : ''

  const intent = useMemo(
    () => parseLayoutIntentFromCatalog(lastPrompt, cards),
    [lastPrompt, cards],
  )

  const instances = useMemo(() => {
    const t = intent.template
    if (!t) return []
    return Array.from({ length: intent.count }, (_, i) => ({
      key: `${t.entry.id}-${i}`,
      card: t,
    }))
  }, [intent.template, intent.count])

  const showStructured =
    layoutPlan != null &&
    layoutPlan.version === 1 &&
    Array.isArray(layoutPlan.blocks) &&
    layoutPlan.blocks.length > 0

  const structuredPreviewCode = useMemo(() => {
    if (!layoutPlan || !showStructured) return ''
    return buildStructuredPreviewHtml(layoutPlan, cards)
  }, [layoutPlan, cards, showStructured])

  return (
    <div className="flex h-full min-h-0 flex-col bg-brandcolor-fill">
      <section
        className="min-h-0 flex-1 overflow-y-auto bg-brandcolor-white p-6"
        aria-label="Layout preview"
      >
        {layoutPromptEntries.length > 0 ? (
          <div className="space-y-4">
            {layoutPlanBusy ? (
              <div
                className="flex items-center gap-4 rounded-lg border border-brandcolor-strokeweak bg-brandcolor-fill px-4 py-5"
                role="status"
                aria-busy="true"
                aria-live="polite"
              >
                <RiLoader4Line
                  className="size-9 shrink-0 animate-spin text-brandcolor-primary"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-brandcolor-textstrong">
                    Generating your UI…
                  </p>
                  <p className="mt-0.5 text-xs text-brandcolor-textweak">
                    Composing layout from your catalog and theme guide.
                  </p>
                </div>
              </div>
            ) : null}

            {layoutPlanError ? (
              <p
                className="rounded-lg border border-brandcolor-destructive/40 bg-brandcolor-banner-warning-bg px-3 py-2 text-sm text-brandcolor-destructive"
                role="alert"
              >
                Structured plan unavailable — showing quick match only.{' '}
                {layoutPlanError}
              </p>
            ) : null}

            {loading ? (
              <p className="text-sm text-brandcolor-textweak">Loading catalog…</p>
            ) : null}
            {error ? (
              <p className="text-sm text-brandcolor-destructive">{error}</p>
            ) : null}

            {showStructured && layoutPlan ? (
              <div className="w-full min-w-0 max-w-3xl">
                <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-brandcolor-textweak">
                    Structured preview
                  </p>
                  <CatalogDetailToolbarButton
                    label="Code"
                    active={structuredCodeOpen}
                    ariaPressed={structuredCodeOpen}
                    title="View HTML and Tailwind"
                    onClick={() => setStructuredCodeOpen(true)}
                  >
                    <RiCodeSSlashLine />
                  </CatalogDetailToolbarButton>
                </div>
                <StructuredPreviewCodeModal
                  open={structuredCodeOpen}
                  code={structuredPreviewCode}
                  onClose={() => setStructuredCodeOpen(false)}
                />
                <form
                  className={`flex w-full flex-col p-6 ${THEME_CARD_SURFACE}`}
                  onSubmit={(e) => e.preventDefault()}
                  aria-label="Structured layout preview form"
                >
                  {layoutPlan.blocks.map((block, i) => {
                    const isLast = i === layoutPlan.blocks.length - 1
                    const nextBlock = layoutPlan.blocks[i + 1]
                    const gapToken = resolveLayoutAfterGap(
                      block,
                      nextBlock,
                      layoutPlan.defaultAfterGap,
                    )
                    const mbBelow = isLast
                      ? ''
                      : getMarginBottomClassForAfterGap(gapToken)
                    const wrapClass = mbBelow
                      ? `min-w-0 ${mbBelow}`
                      : 'min-w-0'

                    return renderPlanBlock(block, cards, i, wrapClass)
                  })}
                </form>
              </div>
            ) : null}

            {!loading &&
            !error &&
            !showStructured &&
            intent.unmatchedReason ? (
              <p className="text-sm text-brandcolor-textweak" role="status">
                {intent.unmatchedReason}
              </p>
            ) : null}

            {!loading &&
            !error &&
            !showStructured &&
            intent.template &&
            instances.length > 0 ? (
              <div className="w-full min-w-0 max-w-3xl">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brandcolor-textweak">
                  Quick match
                </p>
                <CatalogPreviewCells
                  instances={instances}
                  layoutMode={intent.layoutMode}
                  gridCols={intent.gridCols}
                  gridRows={intent.gridRows}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}
