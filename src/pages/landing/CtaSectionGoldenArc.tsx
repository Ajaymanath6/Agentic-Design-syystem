import { CtaTopArcGuideGrid } from './CtaGuideGrid'
import {
  CTA_BOTTOM_ARC_PATH,
  CTA_DIAGONAL_ARC_CURVE,
  CTA_TOP_REGION_CLIP,
  ctaArcYAt,
  ctaDiagonalArcYAt,
} from './cta-arc-geometry'
import { LANDING_CTA_SECTION_ARC } from './landing-content'

/** Golden-ratio arcs on the CTA section — light on cream padding. */
export function CtaSectionGoldenArc({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <CtaTopArcGuideGrid
        idPrefix="ctaSecArc"
        clipPathD={CTA_TOP_REGION_CLIP}
        verticalEndY={(x) => Math.min(ctaArcYAt(x), ctaDiagonalArcYAt(x))}
        strokeColor={LANDING_CTA_SECTION_ARC}
      />
      <path
        d={CTA_DIAGONAL_ARC_CURVE}
        fill="none"
        stroke={LANDING_CTA_SECTION_ARC}
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={CTA_BOTTOM_ARC_PATH}
        fill="none"
        stroke={LANDING_CTA_SECTION_ARC}
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
