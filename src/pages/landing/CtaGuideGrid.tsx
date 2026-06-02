import {
  LANDING_CTA_CARD_GRID,
  LANDING_SECTION_GUIDE,
  LANDING_STROKE,
} from './landing-content'
import { CTA_GUIDE_XS } from './cta-art-constants'

export { CTA_GUIDE_XS }

export const CTA_GUIDE_YS_COMPACT = [0, 12.5, 25, 37.5, 50] as const

export const CTA_GUIDE_YS_SECTION = [
  0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100,
] as const

const GUIDE_DASH = { strokeDasharray: '2 2.5' }

export type CtaGuideYs =
  | typeof CTA_GUIDE_YS_COMPACT
  | typeof CTA_GUIDE_YS_SECTION

/** Nine squares outside the card — each maps to a distinct hover texture (indices 0–5). */
export const CTA_SECTION_HIGHLIGHT_CELLS = [
  { col: 0, row: 1, imageIndex: 0 },
  { col: 2, row: 3, imageIndex: 1 },
  { col: 4, row: 5, imageIndex: 2 },
  { col: 6, row: 7, imageIndex: 3 },
  { col: 8, row: 2, imageIndex: 4 },
  { col: 1, row: 4, imageIndex: 3 },
  { col: 3, row: 6, imageIndex: 4 },
  { col: 5, row: 0, imageIndex: 2 },
  { col: 7, row: 5, imageIndex: 0 },
] as const

type GuideGridProps = {
  idPrefix: string
  guideYs: readonly number[]
  verticalEndY?: (x: number) => number
  clipPathD?: string
  strokeColor?: string
}

function CtaGuideGridLayers({
  idPrefix,
  guideYs,
  verticalEndY = () => 100,
  clipPathD,
  strokeColor = LANDING_STROKE,
}: GuideGridProps) {
  const clipId = clipPathD ? `${idPrefix}Clip` : undefined

  const horizontals = guideYs.map((y) => (
    <line
      key={`${idPrefix}-h-${y}`}
      x1={0}
      y1={y}
      x2={100}
      y2={y}
      stroke={strokeColor}
      strokeWidth="0.65"
      {...GUIDE_DASH}
      vectorEffect="non-scaling-stroke"
    />
  ))

  const verticals = CTA_GUIDE_XS.map((x) => (
    <line
      key={`${idPrefix}-v-${x}`}
      x1={x}
      y1={0}
      x2={x}
      y2={verticalEndY(x)}
      stroke={strokeColor}
      strokeWidth="0.65"
      {...GUIDE_DASH}
      vectorEffect="non-scaling-stroke"
    />
  ))

  const layers = (
    <>
      {horizontals}
      {verticals}
    </>
  )

  if (!clipPathD || !clipId) {
    return layers
  }

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <path fillRule="evenodd" d={clipPathD} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{layers}</g>
    </>
  )
}

export function CtaSectionGuideGrid({ className = '' }: { className?: string }) {
  const idPrefix = 'ctaSec'

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <CtaGuideGridLayers
        idPrefix={idPrefix}
        guideYs={CTA_GUIDE_YS_SECTION}
        strokeColor={LANDING_SECTION_GUIDE}
      />
    </svg>
  )
}

export function CtaTopArcGuideGrid({
  idPrefix,
  clipPathD,
  verticalEndY,
  strokeColor = LANDING_CTA_CARD_GRID,
}: {
  idPrefix: string
  clipPathD: string
  verticalEndY: (x: number) => number
  strokeColor?: string
}) {
  return (
    <>
      <defs>
        <clipPath id={`${idPrefix}Clip`}>
          <path fillRule="evenodd" d={clipPathD} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${idPrefix}Clip)`}>
        <CtaGuideGridLayers
          idPrefix={idPrefix}
          guideYs={CTA_GUIDE_YS_COMPACT}
          verticalEndY={verticalEndY}
          strokeColor={strokeColor}
        />
      </g>
    </>
  )
}
