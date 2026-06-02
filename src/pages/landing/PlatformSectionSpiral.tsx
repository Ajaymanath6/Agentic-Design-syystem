import { GoldenSpiralMark } from './GoldenSpiralMark'

/** Left-aligned spiral — oversized, origin off the viewport edge. */
export function PlatformSectionSpiral() {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 top-0 z-0 hidden overflow-visible sm:block"
      aria-hidden
    >
      <div className="relative h-full min-h-[32rem] w-[min(95vw,54rem)] lg:min-h-full lg:w-[min(85vw,58rem)]">
        <GoldenSpiralMark
          align="left"
          scale={12}
          className="w-[min(180vw,72rem)]"
          bleedLeft="24%"
        />
      </div>
    </div>
  )
}

/** Mobile: stacked spiral above copy. */
export function PlatformSectionSpiralMobile() {
  return (
    <div className="relative mb-8 min-h-[18rem] w-full overflow-hidden sm:hidden">
      <GoldenSpiralMark
        align="left"
        scale={7}
        className="w-[min(150vw,34rem)]"
        bleedLeft="14%"
      />
    </div>
  )
}
