type PlatformCardIconProps = {
  src: string
}

const FULL_COLOR_ICONS = new Set([
  '/landing/platform-icons/07-shapes-grid.png',
  '/landing/library-ui-preview.png',
])

/**
 * Line art: muted tone on texture via screen blend.
 * Full-color assets: shown as-is with soft opacity.
 */
export function PlatformCardIcon({ src }: PlatformCardIconProps) {
  const isFullColor = FULL_COLOR_ICONS.has(src)
  const isLibraryPreview = src === '/landing/library-ui-preview.png'

  return (
    <div
      className="relative z-[2] flex h-full min-h-[12rem] w-full items-center justify-center px-4 py-6 sm:min-h-[14rem]"
      aria-hidden
    >
      <div
        className={
          isLibraryPreview
            ? 'h-full min-h-[12rem] w-full overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:min-h-[14rem]'
            : 'flex h-[10.5rem] w-full max-w-[240px] items-center justify-center sm:h-[11.5rem]'
        }
      >
        <img
          src={src}
          alt=""
          className={
            isLibraryPreview
              ? 'h-full w-full object-cover object-top opacity-[0.96] transition-opacity duration-500 group-hover:opacity-100'
              : isFullColor
                ? 'max-h-full w-full object-contain opacity-[0.88] transition-opacity duration-500 group-hover:opacity-100'
                : 'max-h-full w-full object-contain opacity-[0.68] transition-opacity duration-500 group-hover:opacity-[0.82]'
          }
          style={
            isLibraryPreview || isFullColor
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
