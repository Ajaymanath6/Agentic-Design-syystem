import { RiPencilLine } from '@remixicon/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  applyDisplayNameToCanvasNode,
  buildSourceHtmlForCanvasNode,
  type CanvasNode,
} from '../../lib/canvas-node-publish'
import { CatalogSourceHtmlPreview } from '../catalog/CatalogSourceHtmlPreview'
import { Button } from '../Button'

type Props = {
  open: boolean
  blockLabel: string
  onClose: () => void
  onConfirm: (opts: {
    description: string
    sealed: boolean
    /** Catalog / component display name (trimmed). */
    displayName: string
  }) => void
  /** Disables confirm while parent runs POST /api/publish. */
  submitBusy?: boolean
  /**
   * Components canvas: live HTML from block. Pass this (often with `previewNode={null}` when closed).
   * When set, modal shows HTML preview. Mutually exclusive with `screenshotDataUrl` for display.
   */
  previewNode?: CanvasNode | null
  /**
   * Layout studio / legacy: PNG data URL. When `previewNode` is omitted, image preview is used.
   */
  screenshotDataUrl?: string | null
}

export function CanvasPublishModal({
  open,
  blockLabel,
  onClose,
  onConfirm,
  submitBusy = false,
  previewNode,
  screenshotDataUrl,
}: Props) {
  const [description, setDescription] = useState('')
  const [sealed, setSealed] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const wasOpenRef = useRef(false)

  const htmlMode = previewNode !== undefined

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      queueMicrotask(() => {
        setDisplayName(blockLabel)
        setEditingName(false)
      })
    }
    wasOpenRef.current = open
  }, [open, blockLabel])

  useEffect(() => {
    if (!editingName) return
    const id = window.requestAnimationFrame(() => {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    })
    return () => window.cancelAnimationFrame(id)
  }, [editingName])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitBusy) {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, submitBusy])

  const resolvedName = displayName.trim() || blockLabel

  const previewHtml = useMemo(() => {
    if (!previewNode) return ''
    const patched = applyDisplayNameToCanvasNode(previewNode, resolvedName)
    return buildSourceHtmlForCanvasNode(patched)
  }, [previewNode, resolvedName])

  const canPublish = htmlMode
    ? Boolean(previewNode && previewHtml.trim())
    : Boolean(screenshotDataUrl)

  if (!open) return null

  const submit = () => {
    if (!canPublish) return
    onConfirm({
      description: description.trim(),
      sealed,
      displayName: resolvedName,
    })
    setDescription('')
    setSealed(false)
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-brandcolor-textstrong/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="canvas-publish-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitBusy) {
          onClose()
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-lg bg-brandcolor-white p-6 shadow-card ring-1 ring-brandcolor-secondaryfill"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="canvas-publish-title"
          className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-sans text-lg font-semibold text-brandcolor-textstrong"
        >
          <span className="shrink-0">Publish</span>
          {editingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  setEditingName(false)
                }
                if (e.key === 'Escape') {
                  e.preventDefault()
                  setDisplayName(blockLabel)
                  setEditingName(false)
                }
              }}
              maxLength={200}
              aria-label="Component name for catalog"
              className="min-w-[6rem] max-w-[min(100%,16rem)] flex-1 rounded border border-brandcolor-secondaryfill px-2 py-0.5 text-lg font-semibold text-brandcolor-textstrong focus:border-brandcolor-secondary focus:outline-none focus:ring-0"
            />
          ) : (
            <>
              <span className="min-w-0 truncate">
                “{displayName.trim() || blockLabel}”
              </span>
              <button
                type="button"
                className="inline-flex shrink-0 items-center justify-center rounded p-1 text-brandcolor-textweak hover:bg-brandcolor-fill hover:text-brandcolor-textstrong focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2"
                aria-label="Edit component name"
                disabled={submitBusy}
                onClick={() => setEditingName(true)}
              >
                <RiPencilLine className="size-5" aria-hidden />
              </button>
            </>
          )}
        </h2>
        <p className="mt-2 text-sm text-brandcolor-textweak">
          {htmlMode ? (
            <>
              Preview matches what the catalog will render from{' '}
              <code className="rounded bg-brandcolor-fill px-1 text-xs">sourceHtml</code>
              . Add a description if you want, then publish.
            </>
          ) : (
            <>
              Review the capture, add a description if you want, then publish to the
              catalog.
            </>
          )}
        </p>
        {htmlMode ? (
          canPublish ? (
            <figure className="mt-4 overflow-hidden rounded-md bg-brandcolor-banner-info-bg/30 ring-1 ring-brandcolor-secondaryfill">
              <div className="max-h-52 overflow-auto p-3">
                <CatalogSourceHtmlPreview
                  html={previewHtml}
                  label={`Preview of ${resolvedName}`}
                  className="w-full"
                />
              </div>
              <figcaption className="sr-only">Component preview</figcaption>
            </figure>
          ) : (
            <p className="mt-4 text-sm text-brandcolor-destructive">
              No block to preview. Close and use Publish from a canvas block.
            </p>
          )
        ) : screenshotDataUrl && canPublish ? (
          <figure className="mt-4 overflow-hidden rounded-md bg-brandcolor-banner-info-bg/30 ring-1 ring-brandcolor-secondaryfill">
            <img
              src={screenshotDataUrl}
              alt=""
              className="max-h-48 w-full object-contain object-center"
            />
            <figcaption className="sr-only">Captured layout thumbnail</figcaption>
          </figure>
        ) : !htmlMode && !canPublish ? (
          <p className="mt-3 text-sm text-brandcolor-destructive">
            Capture the layout preview first, then publish.
          </p>
        ) : null}
        <label className="mt-4 block text-sm font-medium text-brandcolor-textstrong">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-brandcolor-secondaryfill bg-brandcolor-white px-3 py-2 text-sm text-brandcolor-textstrong focus:border-brandcolor-secondary focus:outline-none focus:ring-0"
          />
        </label>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-brandcolor-textstrong">
          <input
            type="checkbox"
            checked={sealed}
            onChange={(e) => setSealed(e.target.checked)}
            className="h-4 w-4 rounded border-brandcolor-strokestrong text-brandcolor-primary focus:ring-brandcolor-primary"
          />
          Sealed (metadata)
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="neutral"
            onClick={onClose}
            disabled={submitBusy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!canPublish || submitBusy}
            onClick={submit}
          >
            {submitBusy ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  )
}
