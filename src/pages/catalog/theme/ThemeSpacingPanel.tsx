import { RiInformationLine } from '@remixicon/react'
import { useCallback, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { TypographySettingModal } from '../../../components/TypographySettingModal'
import { Card } from '../../../components/Card'
import {
  CARD_GAP_SEMANTIC,
  CARD_GAP_SEMANTIC_KEYS,
  CARD_GAP_TAILWIND_KEY,
  CARD_PADDING_SEMANTIC,
  CARD_PADDING_SEMANTIC_KEYS,
  CARD_PADDING_TAILWIND_KEY,
} from '../../../config/theme-card-spacing-semantics'
import {
  SPACING_KEYS,
  type SpacingTokenKey,
} from '../../../config/theme-spacing-defaults'
import {
  approxSpacingDisplayLabel,
  exampleTailwindForToken,
  spacingUseWhenLine,
  SPACING_REFERENCE_ROOT_PX,
} from '../../../lib/theme-spacing-display'
import { validateSpacingValue } from '../../../lib/theme-token-validation'
import type { ThemeEditorOutletContext } from './types'
import { TOKEN_SPACING_HELP } from './token-spacing-help'

const tokenHelpIconButtonClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-brandcolor-fill text-brandcolor-textweak transition-colors hover:bg-brandcolor-strokelight hover:text-brandcolor-textstrong focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-1'

function ThemeSpacingCompactRow({
  spacingKey,
  value,
  onEdit,
  onHelp,
}: {
  spacingKey: SpacingTokenKey
  value: string
  onEdit: () => void
  onHelp: () => void
}) {
  return (
    <li className="min-w-0">
      <div className="flex min-w-0 items-stretch gap-1.5">
        <button
          type="button"
          onClick={onEdit}
          title={`Edit ${spacingKey}: ${value}`}
          aria-label={`Edit spacing ${spacingKey}`}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md bg-brandcolor-fill px-3 py-2 text-left transition-colors hover:bg-brandcolor-strokelight focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-1"
        >
          <span className="shrink-0 font-mono text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong">
            {spacingKey}
          </span>
          <span className="min-w-0 truncate font-mono text-theme-body-small-regular text-brandcolor-textweak">
            {value}
          </span>
        </button>
        <button
          type="button"
          aria-label={`Why is spacing token ${spacingKey} named this way?`}
          title="Token story and prompt phrases"
          onClick={(e) => {
            e.stopPropagation()
            onHelp()
          }}
          className={`${tokenHelpIconButtonClass} border-transparent`}
        >
          <RiInformationLine className="size-5 shrink-0" aria-hidden />
        </button>
      </div>
    </li>
  )
}

export function ThemeSpacingPanel() {
  const { spacingByKey, setSpacing, resetSpacingKey } =
    useOutletContext<ThemeEditorOutletContext>()
  const [editingKey, setEditingKey] = useState<SpacingTokenKey | null>(null)
  const [helpKey, setHelpKey] = useState<SpacingTokenKey | null>(null)

  const closeModal = useCallback(() => setEditingKey(null), [])
  const closeHelp = useCallback(() => setHelpKey(null), [])

  const openEdit = useCallback((key: SpacingTokenKey) => {
    setHelpKey(null)
    setEditingKey(key)
  }, [])

  const openHelp = useCallback((key: SpacingTokenKey) => {
    setEditingKey(null)
    setHelpKey(key)
  }, [])

  const previewVal = editingKey != null ? spacingByKey[editingKey] : ''
  const previewOk = validateSpacingValue(previewVal)
  const previewDecode = previewOk ? approxSpacingDisplayLabel(previewOk) : null

  const helpEntry = helpKey != null ? TOKEN_SPACING_HELP[helpKey] : null

  return (
    <Card className="p-5">
      <h2 className="text-theme-body-small-emphasis font-theme-semibold uppercase tracking-wide text-brandcolor-textweak">
        Spacing
      </h2>
      <p className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
        Values map to <code className="font-mono">--space-*</code> on{' '}
        <code className="font-mono">:root</code> and Tailwind{' '}
        <code className="font-mono">theme.extend.spacing</code> (e.g.{' '}
        <code className="font-mono">p-cozy</code>, <code className="font-mono">gap-tight</code>).
        Only <code className="font-mono">rem</code> or <code className="font-mono">px</code> lengths.
        The quick reference below uses your <strong className="font-theme-semibold text-brandcolor-textstrong">current</strong> theme values.
      </p>

      <section
        className="mt-5 rounded-lg border border-brandcolor-strokeweak bg-brandcolor-fill/60 p-4"
        aria-labelledby="card-spacing-alias-heading"
      >
        <h3
          id="card-spacing-alias-heading"
          className="text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong"
        >
          Card semantic aliases
        </h3>
        <p className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          Read-only: <code className="font-mono">--card-padding-*</code> and{' '}
          <code className="font-mono">--card-gap-*</code> on <code className="font-mono">:root</code> point at{' '}
          <code className="font-mono">--space-*</code> primitives (see{' '}
          <code className="font-mono">theme-card-spacing-semantics.ts</code>). Use Tailwind{' '}
          <code className="font-mono">p-card-pad-*</code> / <code className="font-mono">gap-card-gap-*</code> when prompts describe card density; tuning a primitive below updates every alias that references it.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-theme-body-small-regular font-theme-semibold text-brandcolor-textstrong">
              Padding (card shell)
            </p>
            <ul className="mt-1.5 space-y-1.5 font-mono text-[11px] leading-snug text-brandcolor-textweak">
              {CARD_PADDING_SEMANTIC_KEYS.map((k) => (
                <li key={k}>
                  <span className="text-brandcolor-textstrong">{CARD_PADDING_TAILWIND_KEY[k]}</span>
                  {' → '}
                  <span className="text-brandcolor-textstrong">{CARD_PADDING_SEMANTIC[k]}</span>
                  {' — '}
                  <span className="font-sans text-theme-body-small-regular">
                    e.g. <code className="font-mono">p-{CARD_PADDING_TAILWIND_KEY[k]}</code>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-theme-body-small-regular font-theme-semibold text-brandcolor-textstrong">
              Gap (inside card)
            </p>
            <ul className="mt-1.5 space-y-1.5 font-mono text-[11px] leading-snug text-brandcolor-textweak">
              {CARD_GAP_SEMANTIC_KEYS.map((k) => (
                <li key={k}>
                  <span className="text-brandcolor-textstrong">{CARD_GAP_TAILWIND_KEY[k]}</span>
                  {' → '}
                  <span className="text-brandcolor-textstrong">{CARD_GAP_SEMANTIC[k]}</span>
                  {' — '}
                  <span className="font-sans text-theme-body-small-regular">
                    e.g. <code className="font-mono">gap-{CARD_GAP_TAILWIND_KEY[k]}</code>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        className="mt-6 rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white p-4"
        aria-labelledby="spacing-how-heading"
      >
        <h3
          id="spacing-how-heading"
          className="text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong"
        >
          How spacing works
        </h3>
        <div className="mt-3 space-y-3 text-theme-body-small-regular leading-relaxed text-brandcolor-textweak">
          <p>
            Think <strong className="font-theme-semibold text-brandcolor-textstrong">inside → out</strong>:{' '}
            <strong className="text-brandcolor-textstrong">padding</strong> is space between a
            component’s border and its content; <strong className="text-brandcolor-textstrong">margin</strong> is space outside the border that pushes neighbors away.{' '}
            <strong className="text-brandcolor-textstrong">Gap</strong> is space between siblings in a flex or grid—like margin, but owned by the parent stack.
          </p>
          <p>
            Names that feel <em>closer</em> in language (<code className="font-mono">micro</code>,{' '}
            <code className="font-mono">tight</code>) are meant to read as <em>closer</em> on screen than{' '}
            <code className="font-mono">cozy</code> or <code className="font-mono">section</code>. Use smaller tokens{' '}
            <strong className="font-theme-semibold text-brandcolor-textstrong">inside</strong> a single component (icon + label, title + meta),{' '}
            <code className="font-mono">cozy</code> for the card shell, and{' '}
            <code className="font-mono">section</code> / <code className="font-mono">hero</code> for breathing room{' '}
            <strong className="font-theme-semibold text-brandcolor-textstrong">between</strong> blocks on the page.
          </p>
          <p className="text-theme-body-small-regular text-brandcolor-textweak">
            Approximate pixel hints assume a <strong className="text-brandcolor-textstrong">{SPACING_REFERENCE_ROOT_PX}px</strong> root font size for{' '}
            <code className="font-mono">rem</code>—layout still follows real <code className="font-mono">rem</code> and user settings; see the{' '}
            <a href="#spacing-quick-ref" className="font-theme-medium text-brandcolor-primary underline-offset-2 hover:underline">
              quick reference
            </a>{' '}
            for live decode.
          </p>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="spacing-quick-ref">
        <h3
          id="spacing-quick-ref"
          className="text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong"
        >
          Quick reference (current theme)
        </h3>
        <p className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          Token, CSS value, documentary ~px, example utilities, and a one-line “when” hint. Row actions below open edit; the info icon opens the same story per token.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-brandcolor-strokeweak">
          <table className="min-w-[40rem] w-full border-collapse text-left text-theme-body-small-regular">
            <thead>
              <tr className="border-b border-brandcolor-strokeweak bg-brandcolor-fill">
                <th className="px-3 py-2 font-theme-semibold text-brandcolor-textstrong">Token</th>
                <th className="px-3 py-2 font-theme-semibold text-brandcolor-textstrong">Value</th>
                <th className="px-3 py-2 font-theme-semibold text-brandcolor-textstrong">~Px</th>
                <th className="px-3 py-2 font-theme-semibold text-brandcolor-textstrong">Tailwind examples</th>
                <th className="px-3 py-2 font-theme-semibold text-brandcolor-textstrong">When to use</th>
              </tr>
            </thead>
            <tbody>
              {SPACING_KEYS.map((key) => {
                const v = spacingByKey[key]
                const ok = validateSpacingValue(v)
                const approx = ok ? approxSpacingDisplayLabel(ok) : null
                return (
                  <tr key={key} className="border-b border-brandcolor-strokeweak last:border-0">
                    <td className="px-3 py-2 font-mono text-brandcolor-textstrong">{key}</td>
                    <td className="px-3 py-2 font-mono text-brandcolor-textweak">{v}</td>
                    <td className="px-3 py-2 text-brandcolor-textweak">
                      {approx ?? (ok ? '—' : 'invalid')}
                    </td>
                    <td className="max-w-[14rem] px-3 py-2 font-mono text-[11px] leading-snug text-brandcolor-textweak">
                      {exampleTailwindForToken(key)}
                    </td>
                    <td className="px-3 py-2 text-brandcolor-textweak">{spacingUseWhenLine(key)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="spacing-edit-list-heading">
        <h3
          id="spacing-edit-list-heading"
          className="text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong"
        >
          Edit tokens
        </h3>
        <p className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
          Click a row to change the length. Use the info icon for prompt phrases and layout guidance without entering edit mode.
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-1.5">
          {SPACING_KEYS.map((key) => (
            <ThemeSpacingCompactRow
              key={key}
              spacingKey={key}
              value={spacingByKey[key]}
              onEdit={() => openEdit(key)}
              onHelp={() => openHelp(key)}
            />
          ))}
        </ul>
      </section>

      <TypographySettingModal
        open={editingKey !== null}
        onClose={closeModal}
        title="Edit spacing"
        subtitle={editingKey ?? undefined}
        titleId="spacing-setting-modal-title"
      >
        {editingKey ? (
          <div className="flex min-w-0 flex-col gap-4">
            {previewOk ? (
              <div className="flex items-center gap-3">
                <div
                  className="shrink-0 rounded border border-brandcolor-strokeweak bg-brandcolor-fill"
                  style={{ padding: previewOk }}
                  title="Padding preview"
                >
                  <span className="inline-block rounded bg-brandcolor-white px-2 py-1 text-theme-body-small-regular text-brandcolor-textweak">
                    content
                  </span>
                </div>
                <span className="text-theme-body-small-regular text-brandcolor-textweak">
                  Outer box uses this value as padding around the inner block.
                </span>
              </div>
            ) : null}
            <div>
              <label
                className="text-theme-body-small-regular text-brandcolor-textweak"
                htmlFor={`theme-spacing-modal-${editingKey}`}
              >
                Length (<code className="font-mono">rem</code> or{' '}
                <code className="font-mono">px</code>)
              </label>
              <div className="mt-0.5 rounded border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1.5 transition-colors hover:bg-brandcolor-fill focus-within:border-brandcolor-primary focus-within:ring-0">
                <textarea
                  id={`theme-spacing-modal-${editingKey}`}
                  value={spacingByKey[editingKey]}
                  onChange={(e) => setSpacing(editingKey, e.target.value)}
                  spellCheck={false}
                  rows={2}
                  className="min-h-[3rem] w-full resize-y border-0 bg-transparent font-mono text-theme-body-small-regular leading-snug text-brandcolor-textstrong outline-none focus:ring-0"
                />
              </div>
              {previewDecode ? (
                <p className="mt-2 font-mono text-theme-body-small-regular text-brandcolor-textweak">
                  Decode: <span className="text-brandcolor-textstrong">{previewDecode}</span>
                </p>
              ) : previewOk ? null : (
                <p className="mt-2 text-theme-body-small-regular text-brandcolor-textweak">
                  Enter a value like <code className="font-mono">1rem</code> or{' '}
                  <code className="font-mono">8px</code> to see the ~px hint.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => resetSpacingKey(editingKey)}
              className="self-start text-theme-body-small-regular font-theme-medium text-brandcolor-textweak hover:text-brandcolor-textstrong"
            >
              Reset to default
            </button>
          </div>
        ) : null}
      </TypographySettingModal>

      <TypographySettingModal
        open={helpKey !== null && helpEntry != null}
        onClose={closeHelp}
        title={helpEntry?.title ?? ''}
        subtitle={helpKey ?? undefined}
        titleId="spacing-help-modal-title"
      >
        {helpEntry ? helpEntry.body : null}
      </TypographySettingModal>
    </Card>
  )
}
