/**
 * Shared shell for every world block on ComponentsCanvasSurface: absolute position,
 * hover toolbar (Capture / Code / Delete), pointer-drag body wrapper.
 *
 * To add a new block kind: extend CanvasNode + publish helpers under src/lib/, append
 * to nodes, and render body content only in ComponentsCanvasSurface — pass it as
 * children with the appropriate bodyClassName.
 */
import {
  RiCameraLine,
  RiCodeSSlashLine,
  RiDeleteBinLine,
  RiLoader4Line,
} from '@remixicon/react'
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

const toolbarBtn =
  'inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold text-brandcolor-textstrong transition-colors hover:bg-brandcolor-white'

export type CanvasWorldBlockChromeVariant = 'default' | 'sidebar'

export type CanvasWorldBlockProps = {
  x: number
  y: number
  width: number
  isDragging: boolean
  rootRef: (el: HTMLDivElement | null) => void
  capturingHideChrome: boolean
  toolbarLabel: string
  captureBusy: boolean
  onCapture: () => void
  onCode: () => void
  onDelete: () => void
  bodyClassName: string
  onBodyPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void
  onBodyPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void
  onBodyPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void
  onBodyPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => void
  children: ReactNode
  /** false → overflow-visible so valid-state input shadows are not clipped */
  clipShell?: boolean
  /** `sidebar` → right-edge stroke only (product nav preview). */
  chromeVariant?: CanvasWorldBlockChromeVariant
  bodyStyle?: CSSProperties
}

export function CanvasWorldBlock({
  x,
  y,
  width,
  isDragging,
  rootRef,
  capturingHideChrome,
  toolbarLabel,
  captureBusy,
  onCapture,
  onCode,
  onDelete,
  bodyClassName,
  onBodyPointerDown,
  onBodyPointerMove,
  onBodyPointerUp,
  onBodyPointerCancel,
  children,
  clipShell = true,
  chromeVariant = 'default',
  bodyStyle,
}: CanvasWorldBlockProps) {
  const blockShell =
    chromeVariant === 'sidebar'
      ? isDragging
        ? 'border-2 border-brandcolor-strokeweak'
        : 'border-0 border-r border-brandcolor-strokeweak'
      : isDragging
        ? 'border-2 border-brandcolor-strokeweak'
        : 'border border-brandcolor-strokeweak'

  return (
    <div
      ref={rootRef}
      className={`group absolute z-[2] min-w-0 ${
        clipShell ? 'overflow-hidden' : 'overflow-visible'
      } rounded-lg bg-brandcolor-white shadow-card ${blockShell}`}
      style={{ left: x, top: y, width }}
    >
      <div
        className={`flex items-center gap-0.5 overflow-visible border-b border-transparent bg-brandcolor-fill px-1 transition-[max-height,opacity,padding] duration-150 ${
          capturingHideChrome
            ? 'max-h-0 border-0 py-0 opacity-0'
            : 'max-h-0 py-0 opacity-0 group-hover:max-h-10 group-hover:border-brandcolor-strokeweak group-hover:py-1 group-hover:opacity-100'
        }`}
        data-canvas-card-toolbar
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span className="flex min-w-0 flex-1 basis-0">
          <span className="min-w-0 flex-1 truncate px-0.5 text-[11px] font-semibold text-brandcolor-textstrong">
            {toolbarLabel}
          </span>
        </span>
        <button
          type="button"
          className={toolbarBtn}
          aria-label={`Capture ${toolbarLabel} — opens publish flow`}
          disabled={captureBusy}
          onClick={(e) => {
            e.stopPropagation()
            onCapture()
          }}
        >
          {captureBusy ? (
            <RiLoader4Line
              className="size-3.5 shrink-0 animate-spin"
              aria-hidden
            />
          ) : (
            <RiCameraLine className="size-3.5 shrink-0" aria-hidden />
          )}
          Capture
        </button>
        <button
          type="button"
          className={toolbarBtn}
          aria-label={`Code for ${toolbarLabel} — source HTML and blueprint JSON`}
          onClick={(e) => {
            e.stopPropagation()
            onCode()
          }}
        >
          <RiCodeSSlashLine className="size-3.5 shrink-0" aria-hidden />
          Code
        </button>
        <button
          type="button"
          className={`${toolbarBtn} text-brandcolor-destructive hover:bg-brandcolor-banner-warning-bg`}
          aria-label={`Delete ${toolbarLabel} — removes from canvas and catalog if published`}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <RiDeleteBinLine className="size-3.5 shrink-0" aria-hidden />
          Delete
        </button>
      </div>
      <div
        className={bodyClassName}
        style={bodyStyle}
        onPointerDown={onBodyPointerDown}
        onPointerMove={onBodyPointerMove}
        onPointerUp={onBodyPointerUp}
        onPointerCancel={onBodyPointerCancel}
      >
        {children}
      </div>
    </div>
  )
}
