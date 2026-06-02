import { LANDING_GOLDEN_SPIRAL_SRC } from './landing-content'

type GoldenSpiralMarkProps = {
  align?: 'left' | 'center'
  width?: string
  height?: string
  bleedLeft?: string
  opacity?: number
}

const SPIRAL_COLOR = '#d8d6d0'

/** Golden-ratio spiral — explicit dimensions (avoids Tailwind width conflicts). */
export function GoldenSpiralMark({
  align = 'center',
  width = 'min(92vw, 44rem)',
  height = 'min(85vh, 40rem)',
  bleedLeft = '0%',
  opacity = 0.32,
}: GoldenSpiralMarkProps) {
  const isLeft = align === 'left'

  return (
    <div
      className={
        isLeft
          ? 'pointer-events-none absolute left-0 top-1/2 z-0'
          : 'pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2'
      }
      style={{
        width,
        height,
        transform: isLeft ? `translate(calc(-1 * ${bleedLeft}), -50%)` : undefined,
        backgroundColor: SPIRAL_COLOR,
        opacity,
        WebkitMaskImage: `url(${LANDING_GOLDEN_SPIRAL_SRC})`,
        maskImage: `url(${LANDING_GOLDEN_SPIRAL_SRC})`,
        WebkitMaskSize: 'auto 100%',
        maskSize: 'auto 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: isLeft ? 'left center' : 'center center',
        maskPosition: isLeft ? 'left center' : 'center center',
      }}
      aria-hidden
    />
  )
}
