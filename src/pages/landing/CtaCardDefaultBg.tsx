import { CTA_CARD_DEFAULT_BG } from './cta-art-constants'
import {
  CTA_TEXTURE_BG_POSITION,
  CTA_TEXTURE_BG_SIZE,
} from './landing-textures'

/** Full-card sky gradient — edge-to-edge, no gaps at bottom. */
export function CtaCardDefaultBg() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${CTA_CARD_DEFAULT_BG})`,
          backgroundSize: CTA_TEXTURE_BG_SIZE,
          backgroundPosition: CTA_TEXTURE_BG_POSITION,
        }}
      />
    </div>
  )
}
