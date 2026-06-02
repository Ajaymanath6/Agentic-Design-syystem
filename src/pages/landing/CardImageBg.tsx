import {
  LANDING_TEXTURE_BG_POSITION,
  LANDING_TEXTURE_BG_SIZE,
} from './landing-textures'

type CardImageBgProps = {
  src: string
  className?: string
}

/** Full-bleed card background image (no bottom fade). */
export function CardImageBg({ src, className = '' }: CardImageBgProps) {
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
    </div>
  )
}
