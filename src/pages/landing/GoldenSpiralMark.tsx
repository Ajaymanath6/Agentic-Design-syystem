import { LANDING_GOLDEN_SPIRAL_SRC } from './landing-content'

type GoldenSpiralMarkProps = {
  align?: 'left' | 'center'
  /** Height as a multiple of the container (10 = 1000%). */
  scale?: number
  className?: string
  /** Shift left so the spiral origin sits off-screen. */
  bleedLeft?: string
}

const SPIRAL_COLOR = '#d8d6d0'
const SPIRAL_OPACITY = 0.32

/** Golden-ratio spiral via luminance mask. */
export function GoldenSpiralMark({
  align = 'center',
  scale = 4,
  className = '',
  bleedLeft = '0%',
}: GoldenSpiralMarkProps) {
  const isLeft = align === 'left'
  const heightPct = scale * 100

  return (
    <div
      className={
        isLeft
          ? `pointer-events-none absolute left-0 top-1/2 z-0 w-[min(85vw,36rem)] ${className}`.trim()
          : `pointer-events-none absolute left-1/2 top-1/2 z-0 w-[min(92vw,44rem)] -translate-x-1/2 -translate-y-1/2 ${className}`.trim()
      }
      style={{
        height: `${heightPct}%`,
        transform: isLeft ? `translate(calc(-1 * ${bleedLeft}), -50%)` : undefined,
        backgroundColor: SPIRAL_COLOR,
        opacity: SPIRAL_OPACITY,
        WebkitMaskImage: `url(${LANDING_GOLDEN_SPIRAL_SRC})`,
        maskImage: `url(${LANDING_GOLDEN_SPIRAL_SRC})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: isLeft ? 'left center' : 'center center',
        maskPosition: isLeft ? 'left center' : 'center center',
      }}
      aria-hidden
    />
  )
}
