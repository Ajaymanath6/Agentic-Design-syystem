import { useCallback, useEffect, useState } from 'react'
import {
  RiBookmarkLine,
  RiBookmarkFill,
  RiBracesLine,
  RiCloseLine,
  RiCodeSSlashLine,
  RiDeleteBinLine,
  RiRefreshLine,
} from '@remixicon/react'
import type { CatalogCardModel } from '../../types/catalog'
import { useCatalogRefresh } from '../../context/CatalogRefreshContext'
import { formatPublishedDateLabel } from '../../lib/format-published-date'
import {
  isCatalogBookmarked,
  toggleCatalogBookmark,
} from '../../lib/catalog-bookmarks'
import { isCatalogLayoutEntry } from '../../lib/catalog-layout-entry'
import { postDeleteComponent } from '../../services/publish-workflow'
import { catalogCardDisplayName } from '../../lib/catalog-display-name'
import { CatalogDetailToolbarButton } from './CatalogDetailToolbarButton'

type DetailPanel = 'image' | 'code' | 'blueprint'

type Props = {
  open: boolean
  card: CatalogCardModel | null
  onClose: () => void
}

/**
 * Full-screen catalog component inspector: image by default; code / JSON via toolbar controls.
 */
export function CatalogDetailModal({ open, card, onClose }: Props) {
  const { refreshCatalog } = useCatalogRefresh()
  const [panel, setPanel] = useState<DetailPanel>('image')
  const [bookmarked, setBookmarked] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)

  useEffect(() => {
    if (open && card) {
      setPanel('image')
      setBookmarked(isCatalogBookmarked(card.entry.id))
    }
  }, [open, card?.entry.id])

  const onToggleBookmark = useCallback(() => {
    if (!card) return
    setBookmarked(toggleCatalogBookmark(card.entry.id))
  }, [card])

  const onRefresh = useCallback(() => {
    refreshCatalog()
  }, [refreshCatalog])

  const handleDeleteLayout = useCallback(async () => {
    if (!card || !isCatalogLayoutEntry(card.entry)) return
    const id = card.entry.id
    const name = catalogCardDisplayName(card)
    const ok = window.confirm(
      `Remove "${name}" from the catalog? This deletes this published layout (blueprint, thumbnail, and index entry) everywhere it appears. This cannot be undone.`,
    )
    if (!ok) return
    setDeleteBusy(true)
    try {
      await postDeleteComponent(id)
      if (isCatalogBookmarked(id)) {
        toggleCatalogBookmark(id)
      }
      refreshCatalog()
      onClose()
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e))
    } finally {
      setDeleteBusy(false)
    }
  }, [card, refreshCatalog, onClose])

  if (!open || !card) return null

  const showLayoutDelete = isCatalogLayoutEntry(card.entry)

  const sourceHtml =
    card.blueprint?.data && typeof card.blueprint.data.sourceHtml === 'string'
      ? card.blueprint.data.sourceHtml
      : ''
  const blueprintText = card.blueprint
    ? JSON.stringify(card.blueprint, null, 2)
    : card.loadError ?? 'Blueprint not loaded.'
  const thumbSrc = card.entry.thumbnailPath || card.blueprint?.data?.imageUrl
  const title = catalogCardDisplayName(card)
  const createdLine = formatPublishedDateLabel(card.entry.publishedAt)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brandcolor-textstrong/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
    >
      <div className="flex h-[70vh] w-[60vw] min-h-0 min-w-0 max-h-[70vh] max-w-[60vw] flex-col overflow-hidden rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white shadow-card">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-brandcolor-strokeweak px-4 py-2">
          <div className="min-w-0 flex-1">
            <h2
              id="catalog-modal-title"
              className="truncate font-sans text-lg font-semibold leading-tight text-brandcolor-textstrong"
            >
              {title}
            </h2>
            <p className="mt-0.5 text-xs leading-snug text-brandcolor-textweak">
              {createdLine}
            </p>
          </div>
          <div className="flex max-w-full flex-wrap items-center justify-end gap-0.5">
            <CatalogDetailToolbarButton
              label="Refresh"
              active={false}
              onClick={onRefresh}
            >
              <RiRefreshLine />
            </CatalogDetailToolbarButton>
            <CatalogDetailToolbarButton
              label="Bookmark"
              active={bookmarked}
              ariaPressed={bookmarked}
              onClick={onToggleBookmark}
            >
              {bookmarked ? <RiBookmarkFill /> : <RiBookmarkLine />}
            </CatalogDetailToolbarButton>
            <CatalogDetailToolbarButton
              label="Code"
              active={panel === 'code'}
              ariaPressed={panel === 'code'}
              onClick={() =>
                setPanel((p) => (p === 'code' ? 'image' : 'code'))
              }
            >
              <RiCodeSSlashLine />
            </CatalogDetailToolbarButton>
            <CatalogDetailToolbarButton
              label="JSON"
              active={panel === 'blueprint'}
              ariaPressed={panel === 'blueprint'}
              onClick={() =>
                setPanel((p) => (p === 'blueprint' ? 'image' : 'blueprint'))
              }
            >
              <RiBracesLine />
            </CatalogDetailToolbarButton>
            {showLayoutDelete ? (
              <button
                type="button"
                title="Delete published layout from catalog"
                aria-label="Delete layout from catalog"
                disabled={deleteBusy}
                onClick={() => void handleDeleteLayout()}
                className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-brandcolor-destructive transition-colors hover:bg-brandcolor-banner-warning-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-destructive focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="whitespace-nowrap">
                  {deleteBusy ? 'Deleting…' : 'Delete'}
                </span>
                <RiDeleteBinLine className="size-5 shrink-0" aria-hidden />
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Close"
              title="Close"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-brandcolor-textweak transition-colors hover:bg-brandcolor-fill hover:text-brandcolor-textstrong focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2"
            >
              <RiCloseLine className="size-5" aria-hidden />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden">
          {panel === 'image' && (
            <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
              <div className="flex min-h-0 flex-1 items-center justify-center">
                {thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt={card.blueprint?.data?.imageAlt ?? card.entry.id}
                    className="max-h-full max-w-full rounded-lg border border-brandcolor-strokeweak object-contain"
                  />
                ) : (
                  <p className="text-sm text-brandcolor-textweak">No thumbnail</p>
                )}
              </div>
            </div>
          )}
          {panel === 'code' && (
            <pre className="m-0 min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words rounded-lg border border-brandcolor-strokeweak bg-brandcolor-fill p-[48px] text-xs text-brandcolor-textstrong">
              {sourceHtml || 'No source HTML stored for this component.'}
            </pre>
          )}
          {panel === 'blueprint' && (
            <pre className="m-0 min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words rounded-lg border border-brandcolor-strokeweak bg-brandcolor-fill p-[48px] text-xs text-brandcolor-textstrong">
              {blueprintText}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
