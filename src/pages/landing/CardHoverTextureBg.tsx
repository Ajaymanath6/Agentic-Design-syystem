import { LANDING_CARD_HOVER_TEXTURES } from './landing-content'
import {
  LANDING_TEXTURE_BG_POSITION,
  LANDING_TEXTURE_BG_SIZE,
} from './landing-textures'

function fadeGradient(cardBg: string) {
  return `linear-gradient(to bottom, transparent 0%, ${cardBg}e6 55%, ${cardBg} 100%)`
}

type CardHoverTextureBgProps = {
  textureIndex: number
  fadeInto: string
  hideBottomFade?: boolean
  className?: string
}

/** Full-bleed textured gradient (always visible on feature cards). */
export function CardHoverTextureBg({
  textureIndex,
  fadeInto,
  hideBottomFade = false,
  className = '',
}: CardHoverTextureBgProps) {
  const src =
    LANDING_CARD_HOVER_TEXTURES[
      textureIndex % LANDING_CARD_HOVER_TEXTURES.length
    ]

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[1] ${className}`.trim()}
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: LANDING_TEXTURE_BG_SIZE,
          backgroundPosition: LANDING_TEXTURE_BG_POSITION,
        }}
      />
      {hideBottomFade ? null : (
        <div
          className="absolute inset-x-0 bottom-0 h-[48%]"
          style={{ background: fadeGradient(fadeInto) }}
        />
      )}
    </div>
  )
}
