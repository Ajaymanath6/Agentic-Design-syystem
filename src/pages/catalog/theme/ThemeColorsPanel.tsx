import { useOutletContext } from 'react-router-dom'
import { Card } from '../../../components/Card'
import type { ThemeEditorOutletContext } from './types'
import { THEME_COLOR_GROUPS } from './brand-color-theme-groups'
import { ThemePanelSectionHeading } from './ThemePanelSectionHeading'
import { ThemePanelSubsectionHeading } from './ThemePanelSubsectionHeading'
import { BrandColorPalettePreview } from './BrandColorPalettePreview'
import { ThemeColorTokenCard } from './ThemeColorTokenCard'
import { TOKEN_COLOR_HELP } from './token-color-help'

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
      <Card className="p-5 shadow-none">
        <div className="pb-10">
          <ThemePanelSectionHeading
            title="Brand colors"
            subtitle={
              <>
                Each token maps to <code className="font-mono">--color-*</code> on{' '}
                <code className="font-mono">:root</code>. Hex inputs match typography fields:
                hover fill, focus primary border.
              </>
            }
          />
        </div>

        <BrandColorPalettePreview hexByKey={hexByKey} />

        <div className="space-y-8">
          {THEME_COLOR_GROUPS.map((group, idx) => (
            <section
              key={group.id}
              aria-labelledby={`theme-color-group-${group.id}`}
              className={idx === 0 ? 'pt-10' : undefined}
            >
              <ThemePanelSubsectionHeading
                id={`theme-color-group-${group.id}`}
                title={group.title}
                subtitle={group.description}
                dividerTop={idx > 0}
              />
              <ul className="mt-3 space-y-3">
                {group.keys.map((colorKey) => (
                  <ThemeColorTokenCard
                    key={colorKey}
                    colorKey={colorKey}
                    hex={hexByKey[colorKey]}
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
