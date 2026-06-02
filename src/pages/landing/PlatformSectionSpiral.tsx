import { GoldenSpiralMark } from './GoldenSpiralMark'

/** Left-aligned spiral — large, flush to viewport, aligned with copy block. */
export function PlatformSectionSpiral() {
  return (
    <GoldenSpiralMark
      align="left"
      width="min(110vw, 56rem)"
      height="min(130vh, 52rem)"
      bleedLeft="22vw"
      opacity={0.34}
    />
  )
}

/** Mobile: spiral above copy. */
export function PlatformSectionSpiralMobile() {
  return (
    <div className="relative mb-6 h-[20rem] w-full overflow-hidden sm:hidden">
      <GoldenSpiralMark
        align="left"
        width="min(130vw, 28rem)"
        height="22rem"
        bleedLeft="18vw"
        opacity={0.3}
      />
    </div>
  )
}
