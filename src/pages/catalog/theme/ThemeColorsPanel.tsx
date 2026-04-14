import { RiFileTextLine } from '@remixicon/react'
import { useCallback, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Card } from '../../../components/Card'
import { TypographySettingModal } from '../../../components/TypographySettingModal'
import type { BrandColorKey } from '../../../config/brand-theme-colors'
import type { ThemeEditorOutletContext } from './types'
import { THEME_COLOR_GROUPS } from './brand-color-theme-groups'
import {
  TOKEN_COLOR_HELP,
  type TokenColorHelpEntry,
} from './token-color-help'

const colorHexInputClass =
  'min-w-0 flex-1 rounded border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1.5 font-mono text-theme-body-small-regular text-brandcolor-textstrong transition-colors hover:bg-brandcolor-fill focus:border-brandcolor-primary focus:outline-none focus:ring-0'

const colorResetButtonClass =
  'shrink-0 rounded px-2 py-0.5 text-theme-body-small-regular font-theme-medium text-brandcolor-textweak hover:bg-brandcolor-white hover:text-brandcolor-textstrong'

const tokenHelpIconButtonClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-brandcolor-fill text-brandcolor-textweak transition-colors hover:bg-brandcolor-strokelight hover:text-brandcolor-textstrong focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-1'

function ThemeColorField({
  colorKey,
  hexByKey,
  setColor,
  resetColorKey,
  help,
}: {
  colorKey: BrandColorKey
  hexByKey: Record<BrandColorKey, string>
  setColor: (key: BrandColorKey, hex: string) => void
  resetColorKey: (key: BrandColorKey) => void
  help?: TokenColorHelpEntry
}) {
  const hex = hexByKey[colorKey]
  const pickerValue = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.toUpperCase() : '#000000'
  const [helpOpen, setHelpOpen] = useState(false)
  const closeHelp = useCallback(() => setHelpOpen(false), [])
  const titleId = `token-color-help-${colorKey}`

  return (
    <li>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <label
          htmlFor={`theme-color-${colorKey}`}
          className="min-w-0 font-mono text-theme-body-small-regular text-brandcolor-textstrong"
        >
          {colorKey}
        </label>
        <button
          type="button"
          onClick={() => resetColorKey(colorKey)}
          className={colorResetButtonClass}
        >
          Reset
        </button>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => setColor(colorKey, e.target.value.toUpperCase())}
          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-brandcolor-strokeweak bg-brandcolor-white p-0.5"
          aria-label={`Color picker for ${colorKey}`}
        />
        <input
          id={`theme-color-${colorKey}`}
          type="text"
          value={hexByKey[colorKey]}
          onChange={(e) => setColor(colorKey, e.target.value)}
          spellCheck={false}
          className={colorHexInputClass}
          aria-label={`Hex value for ${colorKey}`}
        />
        {help ? (
          <button
            type="button"
            aria-label={`Why is ${colorKey} named this way?`}
            aria-expanded={helpOpen}
            title="Why this token name?"
            onClick={() => setHelpOpen(true)}
            className={`${tokenHelpIconButtonClass} ${helpOpen ? 'border-brandcolor-strokeweak' : 'border-transparent'}`}
          >
            <RiFileTextLine className="size-5 shrink-0" aria-hidden />
          </button>
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

export function ThemeColorsPanel() {
  const {
    hexByKey,
    setColor,
    resetColorKey,
    readonly,
    fontFamilyLines,
    fontSizeLines,
    lineHeightLines,
    fontWeightLines,
  } = useOutletContext<ThemeEditorOutletContext>()

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-theme-body-small-emphasis font-theme-semibold uppercase tracking-wide text-brandcolor-textweak">
          Brand colors
        </h2>
        <p className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          Each token maps to <code className="font-mono">--color-*</code> on{' '}
          <code className="font-mono">:root</code>. Hex inputs match typography fields: hover
          fill, focus primary border.
        </p>

        <div className="mt-6 space-y-8">
          {THEME_COLOR_GROUPS.map((group, idx) => (
            <section key={group.id} aria-labelledby={`theme-color-group-${group.id}`}>
              <h3
                id={`theme-color-group-${group.id}`}
                className={`text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong ${idx > 0 ? 'border-t border-brandcolor-strokeweak pt-8' : ''}`}
              >
                {group.title}
              </h3>
              {group.description ? (
                <p className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
                  {group.description}
                </p>
              ) : null}
              <ul className="mt-3 space-y-4">
                {group.keys.map((colorKey) => (
                  <ThemeColorField
                    key={colorKey}
                    colorKey={colorKey}
                    hexByKey={hexByKey}
                    setColor={setColor}
                    resetColorKey={resetColorKey}
                    help={TOKEN_COLOR_HELP[colorKey]}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Card>

      <details className="rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white p-4">
        <summary className="cursor-pointer text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong">
          Reference (read-only)
        </summary>
        <p className="mt-2 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          Mirrors relevant <code className="font-mono">theme.extend</code> entries — not
          edited on this page.
        </p>

        <h3 className="mt-4 text-theme-body-small-regular font-theme-semibold text-brandcolor-textstrong">
          Screens
        </h3>
        <ul className="mt-1 font-mono text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          {Object.entries(readonly.screens).map(([k, v]) => (
            <li key={k}>
              {k}: {v}
            </li>
          ))}
        </ul>

        <h3 className="mt-4 text-theme-body-small-regular font-theme-semibold text-brandcolor-textstrong">
          Font families
        </h3>
        <ul className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          {fontFamilyLines}
        </ul>

        <h3 className="mt-4 text-theme-body-small-regular font-theme-semibold text-brandcolor-textstrong">
          Font sizes
        </h3>
        <ul className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          {fontSizeLines}
        </ul>

        <h3 className="mt-4 text-theme-body-small-regular font-theme-semibold text-brandcolor-textstrong">
          Line heights
        </h3>
        <ul className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          {lineHeightLines}
        </ul>

        <h3 className="mt-4 text-theme-body-small-regular font-theme-semibold text-brandcolor-textstrong">
          Font weights
        </h3>
        <ul className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          {fontWeightLines}
        </ul>

        <h3 className="mt-4 text-theme-body-small-regular font-theme-semibold text-brandcolor-textstrong">
          Box shadows
        </h3>
        <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto font-mono text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          {Object.entries(readonly.boxShadow).map(([k, v]) => (
            <li key={k}>
              <span className="text-brandcolor-textstrong">{k}</span>: {v}
            </li>
          ))}
        </ul>

        <h3 className="mt-4 text-theme-body-small-regular font-theme-semibold text-brandcolor-textstrong">
          Border width / radius
        </h3>
        <ul className="mt-1 font-mono text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          {Object.entries(readonly.borderWidth).map(([k, v]) => (
            <li key={k}>
              {k}: {v}
            </li>
          ))}
          {Object.entries(readonly.borderRadius).map(([k, v]) => (
            <li key={`r-${k}`}>
              {k}: {v}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
