type PlatformCardIconProps = {
  src: string
}

const FULL_COLOR_ICONS = new Set(['/landing/platform-icons/07-shapes-grid.png'])

/**
 * Line art: muted tone on texture via screen blend.
 * Full-color assets: shown as-is with soft opacity.
 */
export function PlatformCardIcon({ src }: PlatformCardIconProps) {
  const isFullColor = FULL_COLOR_ICONS.has(src)

  return (
    <div
      className="relative z-[2] flex h-full min-h-[12rem] w-full items-center justify-center px-4 py-6 sm:min-h-[14rem]"
      aria-hidden
    >
      <div className="flex h-[10.5rem] w-full max-w-[240px] items-center justify-center sm:h-[11.5rem]">
        <img
          src={src}
          alt=""
          className={
            isFullColor
              ? 'max-h-full w-full object-contain opacity-[0.88] transition-opacity duration-500 group-hover:opacity-100'
              : 'max-h-full w-full object-contain opacity-[0.68] transition-opacity duration-500 group-hover:opacity-[0.82]'
          }
          style={
            isFullColor
              ? undefined
              : {
                  mixBlendMode: 'screen',
                  filter:
                    'grayscale(1) brightness(0.42) contrast(1.2) sepia(0.35) saturate(0.5)',
                }
          }
        />
      </div>
    </div>
  )
}
