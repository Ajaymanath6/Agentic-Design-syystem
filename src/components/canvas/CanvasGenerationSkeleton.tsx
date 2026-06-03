import type { CanvasGenerationSkeletonPlacement } from '../../lib/compute-canvas-generation-skeleton-placement'

type Props = CanvasGenerationSkeletonPlacement

/** Pulsing square shown on the canvas while Vertex generates a new block. */
export function CanvasGenerationSkeleton({ x, y, w, h }: Props) {
  const squareSize = Math.min(w, h)

  return (
    <div
      className="pointer-events-none absolute z-20 rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white shadow-sm"
      style={{ left: x, top: y, width: w, height: h }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Generating UI on canvas"
    >
      <div className="flex h-full w-full items-center justify-center p-4">
        <div
          className="animate-pulse rounded-md bg-brandcolor-strokeweak"
          style={{ width: squareSize, height: squareSize, maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
    </div>
  )
}
