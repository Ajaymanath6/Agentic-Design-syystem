/** White corner chip with complementary fill (on gradient squares / mock panels). */
export function TextureCornerChip({
  complementColor,
  className = '',
  size = 'section',
}: {
  complementColor: string
  className?: string
  size?: 'section' | 'panel'
}) {
  const box =
    size === 'section'
      ? 'left-1.5 top-1.5 h-[22%] w-[22%] min-h-3 min-w-3'
      : 'right-2 top-2 h-7 w-7'

  return (
    <div
      className={`absolute z-[2] rounded-sm bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] ${box} ${className}`.trim()}
      aria-hidden
    >
      <div
        className="absolute inset-[18%] rounded-[2px]"
        style={{ backgroundColor: complementColor }}
      />
    </div>
  )
}
