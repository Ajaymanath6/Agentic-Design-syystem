import type { BrandColorKey } from '../../../config/brand-theme-colors'
import { BRAND_PALETTE_PREVIEW_KEYS } from './brand-palette-preview-config'
import { hexToRgbDisplay, normalizeHexDisplay } from './brand-palette-display'

type BrandColorPalettePreviewProps = {
  hexByKey: Record<BrandColorKey, string>
}

function PaletteSwatchColumn({
  tokenKey,
  hex,
}: {
  tokenKey: BrandColorKey
  hex: string
}) {
  const displayHex = normalizeHexDisplay(hex)

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div
        className="h-[148px] w-[64px] rounded-[1.125rem] border border-brandcolor-strokeweak sm:h-[156px] sm:w-[68px] sm:rounded-[1.25rem]"
        style={{ backgroundColor: displayHex }}
        aria-hidden
      />
      <span
        className="mt-4 size-6 shrink-0 rounded-full border border-brandcolor-strokeweak"
        style={{ backgroundColor: displayHex }}
        aria-hidden
      />
      <p className="mt-3 max-w-[5.75rem] text-center font-mono text-[11px] font-semibold leading-snug text-brandcolor-textstrong">
        {tokenKey}
      </p>
      <p className="mt-1 text-center font-geist text-[12px] leading-snug text-brandcolor-textweak [font-family:var(--font-geist-stack)]">
        {displayHex}
      </p>
      <p className="mt-0.5 text-center font-geist text-[12px] leading-snug text-brandcolor-textweak [font-family:var(--font-geist-stack)]">
        {hexToRgbDisplay(displayHex)}
      </p>
    </div>
  )
}

/** Palette swatch row — keys in brand-palette-preview-config.ts; values from theme editor. */
export function BrandColorPalettePreview({ hexByKey }: BrandColorPalettePreviewProps) {
  return (
    <section aria-label="Brand palette preview" className="pb-[16px]">
      <div className="grid grid-cols-3 gap-x-3 gap-y-8 sm:grid-cols-4 md:grid-cols-7 md:gap-x-4 md:gap-y-6">
        {BRAND_PALETTE_PREVIEW_KEYS.map((tokenKey) => (
          <PaletteSwatchColumn
            key={tokenKey}
            tokenKey={tokenKey}
            hex={hexByKey[tokenKey]}
          />
        ))}
      </div>
    </section>
  )
}
