import { useState } from 'react'
import { Button } from '../Button'
import type { CatalogCardModel } from '../../types/catalog'
import { postDeleteComponent } from '../../services/publish-workflow'
import { useCatalogRefresh } from '../../context/CatalogRefreshContext'

type Tab = 'code' | 'blueprint' | 'image'

type Props = {
  open: boolean
  card: CatalogCardModel | null
  onClose: () => void
}

export function CatalogDetailModal({ open, card, onClose }: Props) {
  const { refreshCatalog } = useCatalogRefresh()
  const [tab, setTab] = useState<Tab>('image')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (!open || !card) return null

  const sourceHtml =
    card.blueprint?.data && typeof card.blueprint.data.sourceHtml === 'string'
      ? card.blueprint.data.sourceHtml
      : ''
  const blueprintText = card.blueprint
    ? JSON.stringify(card.blueprint, null, 2)
    : card.loadError ?? 'Blueprint not loaded.'
  const thumbSrc = card.entry.thumbnailPath || card.blueprint?.data?.imageUrl

  const handleDelete = async () => {
    if (!window.confirm(`Remove "${card.entry.id}" from the catalog?`)) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await postDeleteComponent(card.entry.id)
      refreshCatalog()
      onClose()
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : String(e))
    } finally {
      setDeleting(false)
    }
  }

  const tabBtn = (id: Tab, label: string) => (
    <button
      type="button"
      key={id}
      onClick={() => setTab(id)}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary ${
        tab === id
          ? 'bg-brandcolor-primary text-brandcolor-white'
          : 'text-brandcolor-textstrong hover:bg-brandcolor-neutralhover'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brandcolor-textstrong/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white shadow-card">
        <div className="flex items-start justify-between gap-4 border-b border-brandcolor-strokeweak px-5 py-4">
          <div>
            <h2
              id="catalog-modal-title"
              className="font-sans text-xl font-semibold text-brandcolor-textstrong"
            >
              {card.entry.importId}
            </h2>
            <p className="mt-1 text-sm text-brandcolor-textweak">
              {card.entry.id} · {card.entry.publishedAt}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm font-medium text-brandcolor-textweak hover:bg-brandcolor-fill hover:text-brandcolor-textstrong"
          >
            Close
          </button>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-brandcolor-strokeweak px-5 py-3">
          {tabBtn('image', 'Image')}
          {tabBtn('code', 'Code')}
          {tabBtn('blueprint', 'Blueprint JSON')}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {tab === 'image' && (
            <div className="flex justify-center">
              {thumbSrc ? (
                <img
                  src={thumbSrc}
                  alt={card.blueprint?.data?.imageAlt ?? card.entry.id}
                  className="max-h-72 max-w-full rounded-lg border border-brandcolor-strokeweak object-contain"
                />
              ) : (
                <p className="text-sm text-brandcolor-textweak">No thumbnail</p>
              )}
            </div>
          )}
          {tab === 'code' && (
            <pre className="max-h-80 overflow-auto rounded-lg border border-brandcolor-strokeweak bg-brandcolor-fill p-4 text-xs text-brandcolor-textstrong">
              {sourceHtml || 'No source HTML stored for this component.'}
            </pre>
          )}
          {tab === 'blueprint' && (
            <pre className="max-h-80 overflow-auto rounded-lg border border-brandcolor-strokeweak bg-brandcolor-fill p-4 text-xs text-brandcolor-textstrong">
              {blueprintText}
            </pre>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brandcolor-strokeweak px-5 py-4">
          {deleteError ? (
            <p className="text-sm text-brandcolor-destructive">{deleteError}</p>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="neutral" onClick={onClose}>
              Done
            </Button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="inline-flex items-center justify-center rounded-md border border-brandcolor-destructive bg-brandcolor-white px-4 py-2 text-sm font-medium text-brandcolor-destructive hover:bg-brandcolor-banner-warning-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-destructive disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
