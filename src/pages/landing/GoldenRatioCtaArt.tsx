import { CTA_CARD_DEFAULT_BG } from './cta-art-constants'
import {
  CTA_ARC_CENTER_X,
  CTA_ARC_CENTER_Y,
  CTA_ARC_RADIUS,
  CTA_BOTTOM_ARC_PATH,
  CTA_DIAGONAL_ARC_CURVE,
  CTA_GRID_STEP,
  CTA_TOP_REGION_CLIP,
  ctaArcYAt,
  ctaDiagonalArcYAt,
} from './cta-arc-geometry'
import { CtaTopArcGuideGrid } from './CtaGuideGrid'
import { LANDING_CTA_CARD_GRID } from './landing-content'

const GRID_COLOR = LANDING_CTA_CARD_GRID
const fullCardClip = `M 0 0 H 100 V 100 H 0 Z`

export const CTA_ARC_CENTROID_PERCENT = {
  left: CTA_ARC_CENTER_X,
  top: CTA_ARC_CENTER_Y - CTA_ARC_RADIUS / 2,
} as const

export function isCtaCellAboveArc(
  x0: number,
  x1: number,
  _y0: number,
  y1: number,
): boolean {
  const midX = (x0 + x1) / 2
  return y1 <= ctaArcYAt(midX) - 0.35
}

function CtaArtDefs({ patternId }: { patternId: string }) {
  const gridId = `${patternId}Grid`
  const textureId = `${patternId}Texture`
  const clipId = `${patternId}Clip`

  return (
    <defs>
      <clipPath id={clipId}>
        <path d={fullCardClip} />
      </clipPath>
      <pattern
        id={textureId}
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <image
          href={CTA_CARD_DEFAULT_BG}
          width="1"
          height="1"
          preserveAspectRatio="xMidYMid slice"
        />
      </pattern>
      <pattern
        id={gridId}
        width={CTA_GRID_STEP}
        height={CTA_GRID_STEP}
        patternUnits="userSpaceOnUse"
      >
        <path
          d={`M ${CTA_GRID_STEP} 0 L 0 0 0 ${CTA_GRID_STEP}`}
          fill="none"
          stroke={GRID_COLOR}
          strokeWidth="0.4"
        />
      </pattern>
    </defs>
  )
}

export function GoldenRatioCtaArtBase() {
  return (
    <div className="absolute inset-0 z-0">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <CtaArtDefs patternId="ctaBase" />
        <rect width="100" height="100" fill="url(#ctaBaseTexture)" stroke="none" />
      </svg>
    </div>
  )
}

export function GoldenRatioCtaArtGuides() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[20]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <CtaArtDefs patternId="ctaGuide" />
        <rect
          width="100"
          height="100"
          fill="url(#ctaGuideGrid)"
          clipPath="url(#ctaGuideClip)"
        />
        <CtaTopArcGuideGrid
          idPrefix="ctaCard"
          clipPathD={CTA_TOP_REGION_CLIP}
          verticalEndY={(x) => Math.min(ctaArcYAt(x), ctaDiagonalArcYAt(x))}
          strokeColor={LANDING_CTA_CARD_GRID}
        />
        <path
          d={CTA_DIAGONAL_ARC_CURVE}
          fill="none"
          stroke={GRID_COLOR}
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={CTA_BOTTOM_ARC_PATH}
          fill="none"
          stroke={GRID_COLOR}
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

export function GoldenRatioCtaArt() {
  return (
    <div className="relative h-full w-full">
      <GoldenRatioCtaArtBase />
      <GoldenRatioCtaArtGuides />
    </div>
  )
}
