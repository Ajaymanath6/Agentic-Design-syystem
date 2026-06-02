import { GoldenSpiralMark } from './GoldenSpiralMark'

/** Left edge — no padding; bleeds off viewport (15% smaller than prior size). */
export function PlatformSectionSpiral() {
  return (
    <GoldenSpiralMark
      align="left"
      width="min(94vw, 48rem)"
      height="min(110vh, 44rem)"
      bleedLeft="26vw"
      opacity={0.34}
    />
  )
}

/** Mobile: spiral above centered copy. */
export function PlatformSectionSpiralMobile() {
  return (
    <div className="relative mb-6 h-[19rem] w-full overflow-hidden sm:hidden">
      <GoldenSpiralMark
        align="left"
        width="min(110vw, 24rem)"
        height="19rem"
        bleedLeft="20vw"
        opacity={0.3}
      />
    </div>
  )
}
