import { useState } from 'react'

type Tab = 'json' | 'code'

type Props = {
  open: boolean
  title: string
  componentId?: string
  jsonText: string
  codeText: string
  errorText?: string | null
  busy?: boolean
  onClose: () => void
}

export function CanvasBlockInspectModal({
  open,
  title,
  componentId = '',
  jsonText,
  codeText,
  errorText,
  busy = false,
  onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>('json')

  if (!open) return null

  const panelClass =
    'min-h-[200px] flex-1 overflow-auto rounded-md bg-brandcolor-white p-3 ring-1 ring-brandcolor-secondaryfill'

  const headline = componentId
    ? `${title} · ${componentId}`
    : title

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center bg-brandcolor-textstrong/30 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="canvas-inspect-title"
    >
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-brandcolor-white p-4 shadow-card ring-1 ring-brandcolor-secondaryfill sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brandcolor-secondaryfill pb-3">
          <div>
            <h2
              id="canvas-inspect-title"
              className="font-sans text-lg font-semibold text-brandcolor-textstrong"
            >
              Inspect: {headline}
            </h2>
            {componentId ? (
              <p className="mt-0.5 text-xs text-brandcolor-textweak">
                Block label: {title} · component id:{' '}
                <code className="text-brandcolor-textstrong">{componentId}</code>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-brandcolor-secondary hover:bg-brandcolor-secondaryfill focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2"
          >
            Close
          </button>
        </div>

        <div
          className="mt-3 flex flex-nowrap gap-1 rounded-lg bg-brandcolor-banner-info-bg/40 p-1 ring-1 ring-brandcolor-secondaryfill"
          role="tablist"
          aria-label="Inspect content"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'json'}
            aria-label="Blueprint JSON"
            onClick={() => setTab('json')}
            className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-semibold transition-colors ${
              tab === 'json'
                ? 'bg-brandcolor-white text-brandcolor-secondary shadow-sm ring-1 ring-brandcolor-secondaryfill'
                : 'text-brandcolor-textweak hover:text-brandcolor-textstrong'
            }`}
          >
            JSON
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'code'}
            aria-label="Source code and HTML"
            onClick={() => setTab('code')}
            className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-semibold transition-colors ${
              tab === 'code'
                ? 'bg-brandcolor-white text-brandcolor-secondary shadow-sm ring-1 ring-brandcolor-secondaryfill'
                : 'text-brandcolor-textweak hover:text-brandcolor-textstrong'
            }`}
          >
            Code
          </button>
        </div>

        <div className="mt-3 flex min-h-[280px] flex-1 flex-col overflow-hidden">
          {tab === 'code' ? (
            <pre
              className={`${panelClass} whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-brandcolor-textstrong`}
            >
              {codeText || '—'}
            </pre>
          ) : busy ? (
            <p className="text-sm text-brandcolor-textweak">
              Loading blueprint JSON…
            </p>
          ) : errorText ? (
            <div className={panelClass}>
              <p className="text-sm text-brandcolor-destructive">{errorText}</p>
              <p className="mt-2 text-xs text-brandcolor-textweak">
                Code tab still shows serialized HTML and any TSX excerpt (no
                server required).
              </p>
            </div>
          ) : (
            <pre
              className={`${panelClass} whitespace-pre-wrap font-mono text-xs text-brandcolor-textstrong`}
            >
              {jsonText || '—'}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
