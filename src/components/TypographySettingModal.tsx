import { RiCloseLine } from '@remixicon/react'
import { useCallback, useEffect, type ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  subtitle?: string | null
  children: ReactNode
  onClose: () => void
  /** `aria-labelledby` id for the title (avoid duplicate ids when multiple editors exist). */
  titleId?: string
}

/**
 * Small modal shell for theme editors (typography fs/lh, shadows, etc.) — matches catalog/canvas overlay pattern.
 */
export function TypographySettingModal({
  open,
  title,
  subtitle,
  children,
  onClose,
  titleId = 'typography-setting-modal-title',
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const onBackdropMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-brandcolor-textstrong/30 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={onBackdropMouseDown}
    >
      <div
        className="flex max-h-[min(92vh,calc(100vh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-brandcolor-white shadow-card ring-1 ring-brandcolor-secondaryfill"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 flex-wrap items-start justify-between gap-2 border-b border-brandcolor-strokeweak px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="font-sans text-theme-body-medium-emphasis font-theme-semibold text-brandcolor-textstrong"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 font-mono text-theme-body-small-regular leading-snug text-brandcolor-textweak">
                {subtitle}
              </p>
            ) : null}
          </div>
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
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
