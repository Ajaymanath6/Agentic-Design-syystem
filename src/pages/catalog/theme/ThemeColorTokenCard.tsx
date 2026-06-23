import { RiFileCopyLine, RiFileTextLine } from '@remixicon/react'
import { useCallback, useEffect, useState } from 'react'
import { TypographySettingModal } from '../../../components/TypographySettingModal'
import type { BrandColorKey } from '../../../config/brand-theme-colors'
import { normalizeHexDisplay } from './brand-palette-display'
import type { TokenColorHelpEntry } from './token-color-help'
import { APP_SAVE_BUTTON_COMPACT } from '../../home/home-layout'
import { themePanelSectionSurfaceClass } from './theme-panel-section-surface'

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

function normalizeHexInput(raw: string): string | null {
  const trimmed = raw.trim()
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  if (!/^#[0-9A-Fa-f]{6}$/.test(withHash)) return null
  return withHash.toUpperCase()
}

const draftInputClass =
  'min-w-0 flex-1 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-3 py-2 font-mono text-theme-body-small-regular text-brandcolor-textstrong transition-colors hover:bg-brandcolor-fill focus:border-brandcolor-primary focus:outline-none focus:ring-0'

const headerIconButtonClass =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-brandcolor-strokeweak bg-brandcolor-white text-brandcolor-textweak transition-colors hover:bg-brandcolor-strokelight hover:text-brandcolor-textstrong focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-1'

type ThemeColorTokenCardProps = {
  colorKey: BrandColorKey
  hex: string
  setColor: (key: BrandColorKey, hex: string) => void
  resetColorKey: (key: BrandColorKey) => void
  help?: TokenColorHelpEntry
}

export function ThemeColorTokenCard({
  colorKey,
  hex,
  setColor,
  resetColorKey,
  help,
}: ThemeColorTokenCardProps) {
  const savedHex = normalizeHexDisplay(hex)
  const [draft, setDraft] = useState(hex)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const closeHelp = useCallback(() => setHelpOpen(false), [])
  const titleId = `token-color-help-${colorKey}`

  useEffect(() => {
    setDraft(hex)
    setSaveError(null)
  }, [hex])

  const handleCopy = useCallback(async () => {
    const ok = await copyTextToClipboard(savedHex)
    setCopyFeedback(ok ? 'Copied' : 'Copy failed')
    window.setTimeout(() => setCopyFeedback(null), 1600)
  }, [savedHex])

  const handleSave = useCallback(() => {
    const normalized = normalizeHexInput(draft)
    if (!normalized) {
      setSaveError('Enter a valid 6-digit hex (e.g. #F84416).')
      return
    }
    setSaveError(null)
    setColor(colorKey, normalized)
  }, [colorKey, draft, setColor])

  const handleReset = useCallback(() => {
    resetColorKey(colorKey)
  }, [colorKey, resetColorKey])

  return (
    <li className={`overflow-hidden ${themePanelSectionSurfaceClass}`}>
      <div className="flex items-center justify-between gap-2 border-b border-brandcolor-strokeweak bg-brandcolor-fill px-3 py-2">
        <p className="min-w-0 truncate font-mono text-[13px] leading-snug text-brandcolor-textstrong">
          <span className="text-brandcolor-textweak">{'{Color}:'}</span>{' '}
          {colorKey}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {copyFeedback ? (
            <span className="text-[11px] text-brandcolor-textweak" role="status">
              {copyFeedback}
            </span>
          ) : null}
          {help ? (
            <button
              type="button"
              aria-label={`Why is ${colorKey} named this way?`}
              aria-expanded={helpOpen}
              title="Why this token name?"
              onClick={() => setHelpOpen(true)}
              className={headerIconButtonClass}
            >
              <RiFileTextLine className="size-4 shrink-0" aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            aria-label={`Copy hex for ${colorKey}`}
            title="Copy hex"
            onClick={() => void handleCopy()}
            className={headerIconButtonClass}
          >
            <RiFileCopyLine className="size-4 shrink-0" aria-hidden />
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-3 rounded-md border border-brandcolor-strokeweak bg-brandcolor-fill/50 px-3 py-2.5">
          <span
            className="size-7 shrink-0 rounded-md border border-brandcolor-strokeweak"
            style={{ backgroundColor: savedHex }}
            aria-hidden
          />
          <code className="font-mono text-[14px] leading-none text-brandcolor-textstrong">
            {savedHex}
          </code>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            id={`theme-color-${colorKey}`}
            type="text"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              setSaveError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSave()
              }
            }}
            spellCheck={false}
            placeholder="#RRGGBB"
            aria-label={`Edit hex for ${colorKey}`}
            className={draftInputClass}
          />
          <button
            type="button"
            onClick={handleSave}
            className={APP_SAVE_BUTTON_COMPACT}
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="shrink-0 rounded px-2 py-2 text-theme-body-small-regular font-theme-medium text-brandcolor-textweak transition-colors hover:text-brandcolor-textstrong"
          >
            Reset
          </button>
        </div>
        {saveError ? (
          <p className="mt-2 text-theme-body-small-regular text-brandcolor-destructive" role="alert">
            {saveError}
          </p>
        ) : null}
      </div>

      {help ? (
        <TypographySettingModal
          open={helpOpen}
          onClose={closeHelp}
          title={help.title}
          subtitle={colorKey}
          titleId={titleId}
        >
          {help.body}
        </TypographySettingModal>
      ) : null}
    </li>
  )
}
