import { RiChat1Line, RiCrop2Line } from '@remixicon/react'

export type CanvasFloatingTool = 'select' | 'frame'

type Props = {
  activeTool: CanvasFloatingTool
  onToolChange: (tool: CanvasFloatingTool) => void
  onPromptFocus: () => void
}

const btnBase =
  'flex size-9 items-center justify-center rounded-md text-brandcolor-textweak transition-colors hover:bg-brandcolor-fill hover:text-brandcolor-textstrong focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2'
const btnActive =
  'bg-brandcolor-fill text-brandcolor-textstrong ring-1 ring-brandcolor-strokeweak'

/** Figma-style vertical tool strip; screen-fixed inside the viewport (not world-transformed). */
export function CanvasFloatingTools({
  activeTool,
  onToolChange,
  onPromptFocus,
}: Props) {
  return (
    <div
      className="pointer-events-auto flex flex-col gap-0.5 rounded-xl border border-brandcolor-strokeweak bg-brandcolor-white p-1 shadow-card"
      role="toolbar"
      aria-label="Canvas tools"
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={`${btnBase} ${
          activeTool === 'frame' ? btnActive : ''
        }`}
        aria-label="Frame tool — drag on empty canvas to draw a frame"
        aria-pressed={activeTool === 'frame'}
        onClick={() =>
          onToolChange(activeTool === 'frame' ? 'select' : 'frame')
        }
      >
        <RiCrop2Line className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        className={`${btnBase}`}
        aria-label="Focus prompt — write or edit AI prompt"
        onClick={onPromptFocus}
      >
        <RiChat1Line className="size-4" aria-hidden />
      </button>
    </div>
  )
}
