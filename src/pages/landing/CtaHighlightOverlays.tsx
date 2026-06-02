import { useMemo } from 'react'
import { CTA_GUIDE_XS } from './cta-art-constants'
import { textureComplementColor } from './landing-content'
import {
  LANDING_TEXTURE_BG_POSITION,
  LANDING_TEXTURE_BG_SIZE,
} from './landing-textures'
import { TextureCornerChip } from './TextureCornerChip'

export const CTA_SECTION_HOVER_IMAGES = [
  '/landing/cta-hover/gray.png',
  '/landing/cta-hover/peach.png',
  '/landing/cta-hover/green.png',
  '/landing/cta-hover/purple.png',
  '/landing/cta-hover/blue.png',
] as const

export type CtaHighlightCell = {
  col: number
  row: number
  imageIndex?: number
}

function cellBoundsPercent(
  col: number,
  row: number,
  guideYs: readonly number[],
): { left: string; top: string; width: string; height: string } | null {
  const x0 = CTA_GUIDE_XS[col]
  const x1 = CTA_GUIDE_XS[col + 1]
  const y0 = guideYs[row]
  const y1 = guideYs[row + 1]
  if (x0 === undefined || x1 === undefined || y0 === undefined || y1 === undefined) {
    return null
  }
  return {
    left: `${x0}%`,
    top: `${y0}%`,
    width: `${x1 - x0}%`,
    height: `${y1 - y0}%`,
  }
}

/** Colorful section-padding squares — always visible (no hover). */
export function CtaHighlightOverlays({
  className = '',
  guideYs,
  highlightCells,
}: {
  className?: string
  guideYs: readonly number[]
  highlightCells: ReadonlyArray<CtaHighlightCell>
}) {
  const squares = useMemo(() => {
    return highlightCells.flatMap(({ col, row, imageIndex }, index) => {
      const bounds = cellBoundsPercent(col, row, guideYs)
      if (!bounds) {
        return []
      }
      const imgIdx = imageIndex ?? index % CTA_SECTION_HOVER_IMAGES.length
      const texture = CTA_SECTION_HOVER_IMAGES[imgIdx % CTA_SECTION_HOVER_IMAGES.length]
      if (!texture) {
        return []
      }
      return [{ cellKey: `${col}-${row}`, bounds, texture, imgIdx }]
    })
  }, [guideYs, highlightCells])

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`.trim()}>
      {squares.map((sq) => (
        <div
          key={sq.cellKey}
          className="pointer-events-none absolute overflow-hidden bg-center bg-no-repeat"
          style={{
            ...sq.bounds,
            backgroundImage: `url(${sq.texture})`,
            backgroundSize: LANDING_TEXTURE_BG_SIZE,
            backgroundPosition: LANDING_TEXTURE_BG_POSITION,
          }}
        >
          <TextureCornerChip
            size="section"
            complementColor={textureComplementColor(sq.imgIdx)}
          />
        </div>
      ))}
    </div>
  )
}
