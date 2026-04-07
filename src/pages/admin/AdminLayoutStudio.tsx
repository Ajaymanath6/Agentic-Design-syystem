import { RiLoader4Line } from '@remixicon/react'
import { useMemo } from 'react'
import { useAdminWorkspace } from '../../context/AdminWorkspaceContext'
import { useCatalogCards } from '../../hooks/useCatalogCards'
import { findCardByPlanRef } from '../../lib/layout-plan-catalog'
import { parseLayoutIntentFromCatalog } from '../../lib/layout-prompt-from-catalog'
import {
  getClassesForLayoutKey,
  isLayoutThemeKey,
} from '../../lib/theme-guide-resolve'
import type { CatalogCardModel } from '../../types/catalog'

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
        isGrid ? 'min-w-0' : 'flex min-w-0 flex-wrap gap-4'
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
          <div key={key} className="min-w-0 max-w-full overflow-hidden">
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

/**
 * Layout workspace main pane: instant heuristic preview, then structured plan
 * (theme-guide chrome + catalog sourceHtml) when POST /layout/plan succeeds.
 */
export function AdminLayoutStudio() {
  const { layoutPromptEntries, layoutPlan, layoutPlanBusy, layoutPlanError } =
    useAdminWorkspace()
  const { cards, loading, error } = useCatalogCards()

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

  return (
    <div className="flex h-full min-h-0 flex-col bg-brandcolor-fill">
      <section
        className="min-h-0 flex-1 overflow-y-auto bg-brandcolor-white p-6"
        aria-label="Layout preview"
      >
        {layoutPromptEntries.length === 0 ? (
          <p className="text-sm text-brandcolor-textweak">
            Enter a layout prompt in the sidebar. You get an{' '}
            <strong className="font-medium text-brandcolor-textstrong">
              instant match
            </strong>{' '}
            from the catalog, then a{' '}
            <strong className="font-medium text-brandcolor-textstrong">
              structured layout
            </strong>{' '}
            (title/subtitle from theme tokens + published{' '}
            <code className="text-xs">sourceHtml</code>) when the layout planner
            returns. Name components (
            <code className="text-xs">CaseCardComponent</code>,{' '}
            <code className="text-xs">case-card</code>). Flow repeats or grid (
            <code className="text-xs">3x2</code>) still apply to the quick preview.
          </p>
        ) : null}

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
            ) : (
              <>
                <h2 className="text-sm font-semibold text-brandcolor-textstrong">
                  Latest prompt
                </h2>
                <p className="rounded-lg border border-brandcolor-strokeweak bg-brandcolor-fill px-3 py-2 text-sm text-brandcolor-textstrong">
                  {lastPrompt}
                </p>
              </>
            )}

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

            {showStructured ? (
              <div className="border-t border-brandcolor-strokeweak pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brandcolor-textweak">
                  Structured preview
                </p>
                <form
                  className={`space-y-6 p-6 ${THEME_CARD_SURFACE} max-w-3xl`}
                  onSubmit={(e) => e.preventDefault()}
                  aria-label="Structured layout preview form"
                >
                  {/*
                    Single pass: `blocks` order from the model is document order.
                    Do not group all chrome then all catalog — that ignored user intent
                    (e.g. "card first, then title" vs "title then card").
                  */}
                  {layoutPlan.blocks.map((block, i) => {
                    if (block.type === 'chrome') {
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
                        <div key={`block-${i}-chrome`} className="space-y-1">
                          <h2 className={getClassesForLayoutKey(tk)}>
                            {block.title}
                          </h2>
                          {block.subtitle ? (
                            <p className={getClassesForLayoutKey(sk)}>
                              {block.subtitle}
                            </p>
                          ) : null}
                        </div>
                      )
                    }

                    const card = findCardByPlanRef(block.ref, cards)
                    if (!card) {
                      return (
                        <p
                          key={`block-${i}-catalog`}
                          className="text-sm text-brandcolor-textweak"
                          role="status"
                        >
                          Could not resolve catalog ref &quot;{block.ref}&quot; in
                          the loaded index.
                        </p>
                      )
                    }

                    const strip = Array.from(
                      { length: block.repeat },
                      (_, j) => ({
                        key: `${card.entry.id}-plan-${i}-${j}`,
                        card,
                      }),
                    )
                    const { layoutMode, gridCols, gridRows } =
                      catalogStripProps(block.layout, block.grid)
                    const a11yName =
                      block.layout === 'grid' && block.grid != null
                        ? `${block.grid.cols} by ${block.grid.rows} grid, ${block.repeat} cells, ${card.entry.importId || card.entry.id}`
                        : `${block.repeat} × ${card.entry.importId || card.entry.id}`

                    return (
                      <div
                        key={`block-${i}-catalog`}
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
              <div>
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

            {layoutPromptEntries.length > 1 ? (
              <details className="text-sm text-brandcolor-textweak">
                <summary className="cursor-pointer font-medium text-brandcolor-textstrong">
                  Earlier prompts ({layoutPromptEntries.length - 1})
                </summary>
                <ol className="mt-2 list-decimal space-y-2 pl-5">
                  {layoutPromptEntries.slice(0, -1).map((line, i) => (
                    <li key={`earlier-${i}-${line.slice(0, 16)}`}>{line}</li>
                  ))}
                </ol>
              </details>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}
