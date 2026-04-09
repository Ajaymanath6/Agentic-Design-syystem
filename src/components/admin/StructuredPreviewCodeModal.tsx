import { RiCloseLine } from '@remixicon/react'
import { useCallback, useEffect, useState } from 'react'
import {
  formatHtmlFailureMessage,
  formatHtmlForDisplay,
} from '../../lib/format-html-for-display'

type Props = {
  open: boolean
  code: string
  onClose: () => void
  /** When set, shows Publish next to Copy (e.g. layout structured preview). */
  onPublish?: () => void | Promise<void>
  /** Disables Publish (e.g. no markup or parent capture in flight). */
  publishDisabled?: boolean
  /** Parent sets true while capture/publish pipeline runs. */
  publishBusy?: boolean
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      ta.style.top = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

/**
 * Code-only inspector: Prettier-formatted HTML when possible, copy, Escape to close.
 */
export function StructuredPreviewCodeModal({
  open,
  code,
  onClose,
  onPublish,
  publishDisabled = false,
  publishBusy = false,
}: Props) {
  const [displayText, setDisplayText] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'formatting' | 'ready' | 'error'
  >('idle')
  const [formatNote, setFormatNote] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (!open) {
      setStatus('idle')
      setDisplayText('')
      setFormatNote(null)
      setCopyFeedback(null)
    }
  }

  useEffect(() => {
    if (!open) return

    let cancelled = false
    const ac = new AbortController()

    const run = async () => {
      const trimmed = code.trim()
      if (trimmed.length === 0) {
        if (!cancelled) {
          setDisplayText('')
          setFormatNote(null)
          setStatus('ready')
        }
        return
      }

      if (!cancelled) {
        setStatus('formatting')
        setFormatNote(null)
      }

      const result = await formatHtmlForDisplay(code, { signal: ac.signal })

      if (cancelled) return
      if (!result.ok && result.reason === 'cancelled') return

      if (result.ok) {
        const out = result.formatted.trim()
        setDisplayText(out.length > 0 ? out : trimmed)
        setFormatNote(null)
        setStatus('ready')
        return
      }

      if (result.reason === 'cancelled') return

      setDisplayText(result.fallback)
      setFormatNote(formatHtmlFailureMessage(result.reason))
      setStatus('error')
    }

    void run()

    return () => {
      cancelled = true
      ac.abort()
    }
  }, [open, code])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const publishButtonDisabled =
    !onPublish ||
    publishDisabled ||
    !code.trim() ||
    status === 'formatting' ||
    publishBusy

  const handlePublish = useCallback(() => {
    if (!onPublish || publishButtonDisabled) return
    void onPublish()
  }, [onPublish, publishButtonDisabled])

  const handleCopy = useCallback(async () => {
    const text =
      displayText || (code.trim() ? code : '')
    if (!text) {
      setCopyFeedback('Nothing to copy')
      return
    }
    setCopyFeedback(null)
    const ok = await copyTextToClipboard(text)
    setCopyFeedback(ok ? 'Copied' : 'Copy failed')
    if (ok) {
      window.setTimeout(() => setCopyFeedback(null), 2000)
    }
  }, [displayText, code])

  if (!open) return null

  const preContent =
    status === 'formatting'
      ? 'Formatting…'
      : displayText || (code.trim() ? code : '') || 'No markup to show.'

  const showBanner = formatNote != null && formatNote.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brandcolor-textstrong/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="structured-preview-code-title"
    >
      <div className="flex h-[70vh] w-[60vw] min-h-0 min-w-0 max-h-[70vh] max-w-[60vw] flex-col overflow-hidden rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white shadow-card">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-brandcolor-strokeweak px-4 py-2">
          <h2
            id="structured-preview-code-title"
            className="font-sans text-lg font-semibold leading-tight text-brandcolor-textstrong"
          >
            HTML &amp; Tailwind
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {copyFeedback ? (
              <span className="text-xs text-brandcolor-textweak" role="status">
                {copyFeedback}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => void handleCopy()}
              disabled={status === 'formatting'}
              aria-label="Copy HTML"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-brandcolor-textstrong transition-colors hover:bg-brandcolor-fill focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Copy
            </button>
            {onPublish ? (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishButtonDisabled}
                aria-label="Publish layout to catalog"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-brandcolor-white !bg-brandcolor-primary transition-colors hover:!bg-brandcolor-primaryhover focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {publishBusy ? 'Working…' : 'Publish'}
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

        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4"
          aria-busy={status === 'formatting'}
        >
          {showBanner ? (
            <p
              className="mb-2 rounded-md border border-brandcolor-strokeweak bg-brandcolor-banner-warning-bg px-3 py-2 text-xs text-brandcolor-textstrong"
              role="status"
            >
              {formatNote}
            </p>
          ) : null}
          <pre className="m-0 min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-auto whitespace-pre font-mono text-xs text-brandcolor-textstrong ring-1 ring-brandcolor-strokeweak bg-brandcolor-fill p-4 rounded-md">
            {preContent}
          </pre>
        </div>
      </div>
    </div>
  )
}
