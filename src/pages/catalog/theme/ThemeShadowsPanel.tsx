import { useCallback, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { TypographySettingModal } from '../../../components/TypographySettingModal'
import { Card } from '../../../components/Card'
import { SHADOW_KEYS, type ShadowTokenKey } from '../../../config/theme-shadow-defaults'
import { validateShadowValue } from '../../../lib/theme-token-validation'
import type { ThemeEditorOutletContext } from './types'

function shadowSummary(value: string, maxLen = 64): string {
  const t = value.trim().replace(/\s+/g, ' ')
  if (t.length <= maxLen) return t || '—'
  return `${t.slice(0, maxLen)}…`
}

function ThemeShadowCompactRow({
  shadowKey,
  value,
  onOpen,
}: {
  shadowKey: ShadowTokenKey
  value: string
  onOpen: () => void
}) {
  const summary = shadowSummary(value)
  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={onOpen}
        title={`Edit ${shadowKey}: ${value}`}
        aria-label={`Edit shadow ${shadowKey}`}
        className="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md bg-brandcolor-fill px-3 py-2 text-left transition-colors hover:bg-brandcolor-strokelight focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-1"
      >
        <span className="shrink-0 font-mono text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong">
          {shadowKey}
        </span>
        <span
          className="min-w-0 truncate font-mono text-theme-body-small-regular text-brandcolor-textweak"
          title={value}
        >
          {summary}
        </span>
      </button>
    </li>
  )
}

export function ThemeShadowsPanel() {
  const { shadowByKey, setShadow, resetShadowKey } =
    useOutletContext<ThemeEditorOutletContext>()
  const [editingKey, setEditingKey] = useState<ShadowTokenKey | null>(null)

  const closeModal = useCallback(() => setEditingKey(null), [])

  return (
    <Card className="p-5">
      <h2 className="text-theme-body-small-emphasis font-theme-semibold uppercase tracking-wide text-brandcolor-textweak">
        Shadows
      </h2>
      <p className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
        Values map to <code className="font-mono">--shadow-*</code> on{' '}
        <code className="font-mono">:root</code>. Primary-linked entries use{' '}
        <code className="font-mono">rgb(var(--color-brandcolor-primary) / …)</code> so they
        track the brand primary. Click a row to edit; use the preview when the value is
        valid.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-1.5">
        {SHADOW_KEYS.map((key) => (
          <ThemeShadowCompactRow
            key={key}
            shadowKey={key}
            value={shadowByKey[key]}
            onOpen={() => setEditingKey(key)}
          />
        ))}
      </ul>

      <TypographySettingModal
        open={editingKey !== null}
        onClose={closeModal}
        title="Edit shadow"
        subtitle={editingKey}
        titleId="shadow-setting-modal-title"
      >
        {editingKey ? (
          <div className="flex min-w-0 flex-col gap-4">
            {validateShadowValue(shadowByKey[editingKey]) ? (
              <div className="flex items-center gap-3">
                <span
                  className="inline-block size-12 shrink-0 rounded border border-brandcolor-strokeweak bg-brandcolor-white"
                  style={{ boxShadow: shadowByKey[editingKey] }}
                  title="Preview"
                />
                <span className="text-theme-body-small-regular text-brandcolor-textweak">
                  Preview uses the current value when it passes validation.
                </span>
              </div>
            ) : null}
            <div>
              <label
                className="text-theme-body-small-regular text-brandcolor-textweak"
                htmlFor={`theme-shadow-modal-${editingKey}`}
              >
                CSS <code className="font-mono">box-shadow</code> value
              </label>
              <div className="mt-0.5 rounded border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1.5 transition-colors hover:bg-brandcolor-fill focus-within:border-brandcolor-primary focus-within:ring-0">
                <textarea
                  id={`theme-shadow-modal-${editingKey}`}
                  value={shadowByKey[editingKey]}
                  onChange={(e) => setShadow(editingKey, e.target.value)}
                  spellCheck={false}
                  rows={5}
                  className="min-h-[120px] w-full resize-y border-0 bg-transparent font-mono text-theme-body-small-regular leading-snug text-brandcolor-textstrong outline-none focus:ring-0"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => resetShadowKey(editingKey)}
              className="self-start text-theme-body-small-regular font-theme-medium text-brandcolor-textweak hover:text-brandcolor-textstrong"
            >
              Reset to default
            </button>
          </div>
        ) : null}
      </TypographySettingModal>
    </Card>
  )
}
