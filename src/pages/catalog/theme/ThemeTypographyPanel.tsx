import { useOutletContext } from 'react-router-dom'
import { Card } from '../../../components/Card'
import {
  THEME_BODY_SIZES,
  THEME_BODY_VARIANTS,
  THEME_TITLE_LEVELS,
  typographyFsKeyBody,
  typographyFsKeyTitle,
  typographyLhKeyBody,
  typographyLhKeyTitle,
} from '../../../config/theme-typography-defaults'
import type { ThemeEditorOutletContext } from './types'
import {
  ThemeTypographyFsLhCompactRow,
} from './ThemeTypographyWidgets'

export function ThemeTypographyPanel() {
  const { typoByKey, setTypo, resetTypoKey, setEditingTypoPair, typoFwKeys } =
    useOutletContext<ThemeEditorOutletContext>()

  return (
    <Card className="p-5">
      <h2 className="text-theme-body-small-emphasis font-theme-semibold uppercase tracking-wide text-brandcolor-textweak">
        Typography
      </h2>
      <p className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
        Stacks: comma-separated font names. Sizes: rem or px; line heights: unitless numbers. Arrow keys nudge by 0.001; weights 100–900. Hints use 16px per rem (change if your root font size differs); load webfonts in index.html. Titles: font-lora + text-theme-title-h*. Body: font-sans + text-theme-body-*.
      </p>

      <h3 className="mt-6 text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong">
        Font stacks
      </h3>
      <ul className="mt-2 space-y-4">
        {(
          [
            {
              key: 'font-sans-stack' as const,
              line: (
                <>
                  Body stack{' '}
                  <span className="font-mono text-brandcolor-textstrong">font-sans-stack</span> — IBM Plex Sans — use with font-sans and body text utilities.
                </>
              ),
            },
            {
              key: 'font-lora-stack' as const,
              line: (
                <>
                  Title stack{' '}
                  <span className="font-mono text-brandcolor-textstrong">font-lora-stack</span> — Lora — use with font-lora and title text utilities (H1–H6).
                </>
              ),
            },
          ] as const
        ).map(({ key, line }) => (
          <li key={key}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <p className="min-w-0 flex-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
                {line}
              </p>
              <button
                type="button"
                onClick={() => resetTypoKey(key)}
                className="shrink-0 rounded px-2 py-0.5 text-theme-body-small-regular font-theme-medium text-brandcolor-textweak hover:bg-brandcolor-white hover:text-brandcolor-textstrong"
              >
                Reset
              </button>
            </div>
            <input
              id={`theme-typo-${key}`}
              type="text"
              value={typoByKey[key]}
              onChange={(e) => setTypo(key, e.target.value)}
              spellCheck={false}
              className="mt-1 w-full rounded border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1.5 font-mono text-theme-body-small-regular text-brandcolor-textstrong transition-colors hover:bg-brandcolor-fill focus:border-brandcolor-primary focus:outline-none focus:ring-0"
            />
          </li>
        ))}
      </ul>

      <h3 className="mt-8 text-theme-body-small-emphasis font-theme-semibold uppercase tracking-wide text-brandcolor-textweak">
        Text styles
      </h3>

      <h4 className="mt-4 text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong">
        Title (H1–H6)
      </h4>
      <p className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
        Pair each heading level with font-lora in UI (e.g. font-lora text-theme-title-h3).
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-1.5">
        {THEME_TITLE_LEVELS.map((level) => {
          const fsK = typographyFsKeyTitle(level)
          const lhK = typographyLhKeyTitle(level)
          const heading = `H${level}`
          return (
            <ThemeTypographyFsLhCompactRow
              key={fsK}
              heading={heading}
              fsValue={typoByKey[fsK]}
              lhValue={typoByKey[lhK]}
              onOpenEditor={() =>
                setEditingTypoPair({ fsKey: fsK, lhKey: lhK, heading })
              }
            />
          )
        })}
      </ul>

      <h4 className="mt-8 text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong">
        Body (Large / Medium / Small)
      </h4>
      <p className="mt-1 text-theme-body-small-regular leading-snug text-brandcolor-textweak">
        Three sizes; each has Regular (≈400), Emphasis (≈600), and Bold (≈700) — pair with font-sans and font-theme-regular / font-theme-semibold / font-theme-bold as needed.
      </p>
      <div className="mt-4 space-y-6">
        {THEME_BODY_SIZES.map((size) => (
          <div key={size}>
            <h5 className="text-theme-body-medium-emphasis font-theme-semibold capitalize text-brandcolor-textstrong">
              {size}
            </h5>
            <ul className="mt-2 grid grid-cols-1 gap-1.5">
              {THEME_BODY_VARIANTS.map((variant) => {
                const fsK = typographyFsKeyBody(size, variant)
                const lhK = typographyLhKeyBody(size, variant)
                const heading = `${size} — ${variant}`
                return (
                  <ThemeTypographyFsLhCompactRow
                    key={fsK}
                    heading={heading}
                    fsValue={typoByKey[fsK]}
                    lhValue={typoByKey[lhK]}
                    onOpenEditor={() =>
                      setEditingTypoPair({
                        fsKey: fsK,
                        lhKey: lhK,
                        heading,
                      })
                    }
                  />
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <h3 className="mt-10 text-theme-body-small-emphasis font-theme-semibold text-brandcolor-textstrong">
        Font weights (semantic utilities)
      </h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {typoFwKeys.map((key) => (
          <li
            key={key}
            className="flex flex-col gap-1 rounded-md border border-brandcolor-strokeweak bg-brandcolor-fill p-2"
          >
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor={`theme-fw-${key}`}
                className="truncate font-mono text-theme-body-small-regular text-brandcolor-textstrong"
              >
                {key}
              </label>
              <button
                type="button"
                onClick={() => resetTypoKey(key)}
                className="shrink-0 text-theme-body-small-regular text-brandcolor-textweak hover:text-brandcolor-textstrong"
              >
                Reset
              </button>
            </div>
            <input
              id={`theme-fw-${key}`}
              type="text"
              value={typoByKey[key]}
              onChange={(e) => setTypo(key, e.target.value)}
              spellCheck={false}
              className="rounded border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 font-mono text-theme-body-small-regular transition-colors hover:bg-brandcolor-fill focus:border-brandcolor-primary focus:outline-none focus:ring-0"
            />
          </li>
        ))}
      </ul>
    </Card>
  )
}
