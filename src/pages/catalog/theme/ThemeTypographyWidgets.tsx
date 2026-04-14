import type { TypographyTokenKey } from '../../../config/theme-typography-defaults'
import {
  fontSizeInputHint,
  lineBoxHeightHint,
  stepFontSizeValue,
  stepLineHeightValue,
} from '../../../lib/theme-font-size-hints'

export function ThemeTypographyFsLhEditor({
  fsKey,
  lhKey,
  fsValue,
  lhValue,
  onFsChange,
  onLhChange,
  onResetPair,
}: {
  fsKey: TypographyTokenKey
  lhKey: TypographyTokenKey
  fsValue: string
  lhValue: string
  onFsChange: (v: string) => void
  onLhChange: (v: string) => void
  onResetPair: () => void
}) {
  const fsHint = fontSizeInputHint(fsValue)
  const lhHint = lineBoxHeightHint(fsValue, lhValue)
  return (
    <div className="min-w-0">
      <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <div className="min-w-0">
          <label
            className="text-theme-body-small-regular text-brandcolor-textweak"
            htmlFor={`${fsKey}-modal-inp`}
          >
            {fsKey}
          </label>
          <div className="mt-0.5 flex min-w-0 flex-col gap-1 rounded border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1.5 transition-colors hover:bg-brandcolor-fill focus-within:border-brandcolor-primary focus-within:ring-0">
            <input
              id={`${fsKey}-modal-inp`}
              type="text"
              value={fsValue}
              onChange={(e) => onFsChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
                const next = stepFontSizeValue(
                  fsValue,
                  e.key === 'ArrowUp' ? 1 : -1,
                )
                if (next == null) return
                e.preventDefault()
                onFsChange(next)
              }}
              spellCheck={false}
              aria-describedby={fsHint ? `${fsKey}-modal-hint` : undefined}
              className="w-full min-w-0 border-0 bg-transparent font-mono text-theme-body-small-regular text-brandcolor-textstrong outline-none focus:ring-0"
            />
            {fsHint ? (
              <span
                id={`${fsKey}-modal-hint`}
                className="min-w-0 break-words font-mono text-theme-body-small-regular leading-snug text-brandcolor-textweak select-none"
                aria-live="polite"
              >
                {fsHint}
              </span>
            ) : null}
          </div>
        </div>
        <div className="min-w-0">
          <label
            className="text-theme-body-small-regular text-brandcolor-textweak"
            htmlFor={`${lhKey}-modal-inp`}
          >
            {lhKey}
          </label>
          <div className="mt-0.5 flex min-w-0 flex-col gap-1 rounded border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1.5 transition-colors hover:bg-brandcolor-fill focus-within:border-brandcolor-primary focus-within:ring-0">
            <input
              id={`${lhKey}-modal-inp`}
              type="text"
              value={lhValue}
              onChange={(e) => onLhChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
                const next = stepLineHeightValue(
                  lhValue,
                  e.key === 'ArrowUp' ? 1 : -1,
                )
                if (next == null) return
                e.preventDefault()
                onLhChange(next)
              }}
              spellCheck={false}
              aria-describedby={`${lhKey}-modal-lh-hint`}
              className="w-full min-w-0 border-0 bg-transparent font-mono text-theme-body-small-regular text-brandcolor-textstrong outline-none focus:ring-0"
            />
            <span
              id={`${lhKey}-modal-lh-hint`}
              className="min-w-0 break-words font-mono text-theme-body-small-regular leading-snug text-brandcolor-textweak select-none"
              aria-live="polite"
            >
              {lhHint ?? 'unitless'}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onResetPair}
        className="mt-4 text-theme-body-small-regular font-theme-medium text-brandcolor-textweak hover:text-brandcolor-textstrong"
      >
        Reset pair
      </button>
    </div>
  )
}

export function ThemeTypographyFsLhCompactRow({
  heading,
  fsValue,
  lhValue,
  onOpenEditor,
}: {
  heading: string
  fsValue: string
  lhValue: string
  onOpenEditor: () => void
}) {
  const summary = `${fsValue} / ${lhValue}`
  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={onOpenEditor}
        title={`Edit ${heading}: ${summary}`}
        aria-label={`Edit typography ${heading}, ${summary}`}
        className="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md bg-brandcolor-fill px-3 py-2 text-left transition-colors hover:bg-brandcolor-strokelight focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-1"
      >
        <span className="shrink-0 text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong">
          {heading}
        </span>
        <span
          className="min-w-0 truncate font-mono text-theme-body-small-regular text-brandcolor-textweak"
          title={summary}
        >
          {summary}
        </span>
      </button>
    </li>
  )
}
