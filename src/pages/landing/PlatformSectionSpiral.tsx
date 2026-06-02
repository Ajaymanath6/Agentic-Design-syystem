import { GoldenSpiralMark } from './GoldenSpiralMark'

/** Spiral tip starts at the left viewport edge — minimal bleed. */
export function PlatformSectionSpiral() {
  return (
    <GoldenSpiralMark
      align="left"
      width="min(94vw, 48rem)"
      height="min(110vh, 44rem)"
      bleedLeft="0%"
      opacity={0.34}
    />
  )
}

/** Mobile: spiral above copy, tip from left edge. */
export function PlatformSectionSpiralMobile() {
  return (
    <div className="relative mb-6 h-[19rem] w-full overflow-hidden sm:hidden">
      <GoldenSpiralMark
        align="left"
        width="min(110vw, 24rem)"
        height="19rem"
        bleedLeft="0%"
        opacity={0.3}
      />
    </div>
  )
}
