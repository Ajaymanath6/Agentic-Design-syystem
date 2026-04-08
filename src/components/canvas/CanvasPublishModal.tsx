import { useState } from 'react'
import { Button } from '../Button'

type Props = {
  open: boolean
  blockLabel: string
  canPublish: boolean
  screenshotDataUrl?: string | null
  onClose: () => void
  onConfirm: (opts: { description: string; sealed: boolean }) => void
  /** Disables confirm while parent runs POST /api/publish. */
  submitBusy?: boolean
}

export function CanvasPublishModal({
  open,
  blockLabel,
  canPublish,
  screenshotDataUrl,
  onClose,
  onConfirm,
  submitBusy = false,
}: Props) {
  const [description, setDescription] = useState('')
  const [sealed, setSealed] = useState(false)

  if (!open) return null

  const submit = () => {
    onConfirm({ description: description.trim(), sealed })
    setDescription('')
    setSealed(false)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-brandcolor-textstrong/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="canvas-publish-title"
    >
      <div className="w-full max-w-md rounded-lg bg-brandcolor-white p-6 shadow-card ring-1 ring-brandcolor-secondaryfill">
        <h2
          id="canvas-publish-title"
          className="font-sans text-lg font-semibold text-brandcolor-textstrong"
        >
          Publish “{blockLabel}”
        </h2>
        <p className="mt-2 text-sm text-brandcolor-textweak">
          Review the capture, add a description if you want, then publish to the
          catalog.
        </p>
        {screenshotDataUrl && canPublish ? (
          <figure className="mt-4 overflow-hidden rounded-md bg-brandcolor-banner-info-bg/30 ring-1 ring-brandcolor-secondaryfill">
            <img
              src={screenshotDataUrl}
              alt=""
              className="max-h-48 w-full object-contain object-center"
            />
            <figcaption className="sr-only">Captured component thumbnail</figcaption>
          </figure>
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
        {!canPublish && (
          <p className="mt-3 text-sm text-brandcolor-destructive">
            Use the capture action on the canvas to grab this block first.
          </p>
        )}
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
