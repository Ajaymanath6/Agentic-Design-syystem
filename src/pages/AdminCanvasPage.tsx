import {
  forwardRef,
  type ForwardedRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { getBlockSourceSnippet } from '../canvas/block-source-snippets'
import { CanvasBlockInspectModal } from '../components/canvas/CanvasBlockInspectModal'
import { CanvasPublishModal } from '../components/canvas/CanvasPublishModal'
import { useCatalogRefresh } from '../context/CatalogRefreshContext'
import { captureElementFullPng } from '../lib/capture-screenshot'
import { createBlueprintStructure } from '../lib/blueprint-from-dom'
import { serializeBlockHtml } from '../lib/serialize-block-html'
import {
  postBlueprintPreview,
  postPublish,
} from '../services/publish-workflow'
import {
  ADMIN_CANVAS_DELETED_IDS_KEY,
  ADMIN_CANVAS_LAYOUT_KEY,
  type CanvasElement,
} from '../types/canvas'

type StageState = { tx: number; ty: number; scale: number }

const STAGE_SCALE_MIN = 0.25
const STAGE_SCALE_MAX = 2.5
const STAGE_ZOOM_STEP = 1.12
const CANVAS_GRID_PX = 24

/** From `src/config/theme-guide.json` → componentGuidelines.heading.h3 */
const THEME_GUIDE_HEADING_H3 =
  'font-sans text-lg font-semibold text-brandcolor-textstrong'
/** Body / supporting copy: `text-sm` + `text-brandcolor-textweak` (aligned with input body scale) */
const THEME_GUIDE_TEXT_WEAK_BODY = 'text-sm leading-relaxed text-brandcolor-textweak'

/** White card surface per theme-guide; selection ring is light blue on the canvas wrapper. */
const THEME_CANVAS_BLOCK_SURFACE =
  'rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white shadow-card'

/**
 * Authoritative canvas document: edit this list to add blocks or change defaults.
 * Delete on canvas persists (localStorage); clear `admin-canvas-v2-*` keys to restore removed blocks.
 * `BlockPreview` renders `type` (`button` | `card` | `chart` | …).
 */
/** Stacked column so blocks stay in one band; fit-to-viewport centers them on load. */
const ADMIN_CANVAS_SCENE: CanvasElement[] = [
  {
    id: 'blk-primary-button',
    componentId: 'primary-button',
    type: 'button',
    label: 'Primary button',
    x: 32,
    y: 32,
    width: 240,
    height: 88,
    published: false,
  },
  {
    id: 'blk-sample-card',
    componentId: 'sample-card',
    type: 'card',
    label: 'Sample card',
    subtitle: 'Subtitle uses text-weak; title uses text-strong.',
    paragraph:
      'Every entry in ADMIN_CANVAS_SCENE appears on the canvas. The view auto-fits on load and when you resize the window.',
    x: 32,
    y: 144,
    width: 320,
    height: 200,
    published: false,
  },
  {
    id: 'blk-theme-guide-card',
    componentId: 'theme-guide-card',
    type: 'card',
    label: 'Theme guide card',
    subtitle:
      'Subtitle and paragraph use text-weak; the title matches heading.h3.',
    paragraph:
      'Surface classes match theme-guide.json: rounded-lg, border-brandcolor-strokeweak, bg-brandcolor-white, and shadow-card.',
    x: 32,
    y: 368,
    width: 320,
    height: 220,
    published: false,
  },
  {
    id: 'blk-article-card',
    componentId: 'article-card',
    type: 'article',
    label: 'How we ship components',
    subtitle: 'Design tokens and previews stay in sync with production.',
    paragraph:
      'Article layout uses text-strong for the title and subtitle, and text-weak for body copy so hierarchy stays clear on the canvas.',
    paragraph2:
      'Edit this block in ADMIN_CANVAS_SCENE or extend BlockPreview with more article fields.',
    x: 32,
    y: 612,
    width: 360,
    height: 280,
    published: false,
  },
  {
    id: 'blk-bar-chart',
    componentId: 'bar-chart-stub',
    type: 'chart',
    label: 'Bar chart',
    x: 32,
    y: 916,
    width: 320,
    height: 200,
    published: false,
  },
]

type LayoutPatch = Partial<
  Pick<CanvasElement, 'x' | 'y' | 'width' | 'height' | 'published'>
>

function loadRawDeletedIds(): string[] {
  try {
    const raw = localStorage.getItem(ADMIN_CANVAS_DELETED_IDS_KEY)
    if (!raw) return []
    const p = JSON.parse(raw) as unknown
    return Array.isArray(p)
      ? p.filter((x): x is string => typeof x === 'string')
      : []
  } catch {
    return []
  }
}

/** Record a block as removed so it does not return after refresh. */
function persistDeletedId(id: string): void {
  try {
    const raw = localStorage.getItem(ADMIN_CANVAS_DELETED_IDS_KEY)
    const arr: unknown = raw ? JSON.parse(raw) : []
    const list = Array.isArray(arr)
      ? arr.filter((x): x is string => typeof x === 'string')
      : []
    if (!list.includes(id)) {
      list.push(id)
      localStorage.setItem(ADMIN_CANVAS_DELETED_IDS_KEY, JSON.stringify(list))
    }
  } catch {
    /* ignore */
  }
}

function loadLayoutMap(): Record<string, LayoutPatch> {
  try {
    const raw = localStorage.getItem(ADMIN_CANVAS_LAYOUT_KEY)
    if (!raw) return {}
    const p = JSON.parse(raw) as unknown
    return p && typeof p === 'object' && !Array.isArray(p)
      ? (p as Record<string, LayoutPatch>)
      : {}
  } catch {
    return {}
  }
}

function persistLayoutSnapshot(elements: CanvasElement[]): void {
  try {
    const o: Record<string, LayoutPatch> = {}
    for (const e of elements) {
      o[e.id] = {
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
        published: Boolean(e.published),
      }
    }
    localStorage.setItem(ADMIN_CANVAS_LAYOUT_KEY, JSON.stringify(o))
  } catch {
    /* ignore */
  }
}

/**
 * Scene from code minus persisted deletes, with persisted positions/published.
 */
function buildInitialElements(scene: CanvasElement[]): CanvasElement[] {
  const sceneIds = new Set(scene.map((e) => e.id))
  const prunedDeleted = loadRawDeletedIds().filter((id) => sceneIds.has(id))
  try {
    localStorage.setItem(
      ADMIN_CANVAS_DELETED_IDS_KEY,
      JSON.stringify(prunedDeleted),
    )
  } catch {
    /* ignore */
  }
  const deleted = new Set(prunedDeleted)
  const layout = loadLayoutMap()
  return scene
    .filter((e) => !deleted.has(e.id))
    .map((e) => {
      const p = layout[e.id]
      if (!p) return structuredClone(e)
      return {
        ...e,
        x: typeof p.x === 'number' ? p.x : e.x,
        y: typeof p.y === 'number' ? p.y : e.y,
        width: typeof p.width === 'number' ? p.width : e.width,
        height: typeof p.height === 'number' ? p.height : e.height,
        published:
          typeof p.published === 'boolean' ? p.published : e.published,
      }
    })
}

function IconPreview({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function IconCapture({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function IconPublish({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

/** Fit pan/zoom so every block in `elements` is visible inside the viewport. */
function fitStageToElements(
  elements: CanvasElement[],
  viewportW: number,
  viewportH: number,
  pad: number,
): StageState {
  if (elements.length === 0 || viewportW < 8 || viewportH < 8) {
    return { tx: 0, ty: 0, scale: 1 }
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const el of elements) {
    minX = Math.min(minX, el.x)
    minY = Math.min(minY, el.y)
    maxX = Math.max(maxX, el.x + el.width)
    maxY = Math.max(maxY, el.y + el.height)
  }
  const cw = maxX - minX
  const ch = maxY - minY
  if (cw <= 0 || ch <= 0) {
    return { tx: pad, ty: pad, scale: 1 }
  }
  const innerW = viewportW - 2 * pad
  const innerH = viewportH - 2 * pad
  const scale = clamp(
    Math.min(innerW / cw, innerH / ch),
    STAGE_SCALE_MIN,
    STAGE_SCALE_MAX,
  )
  const tx = (viewportW - cw * scale) / 2 - minX * scale
  const ty = (viewportH - ch * scale) / 2 - minY * scale
  return { tx, ty, scale }
}

export function AdminCanvasPage() {
  const { refreshCatalog } = useCatalogRefresh()
  const [elements, setElements] = useState<CanvasElement[]>(() =>
    buildInitialElements(ADMIN_CANVAS_SCENE),
  )
  const [stage, setStage] = useState<StageState>({
    tx: 0,
    ty: 0,
    scale: 1,
  })
  const [pendingScreenshotByElement, setPendingScreenshotByElement] = useState<
    Record<string, string>
  >({})
  const [inspectOpen, setInspectOpen] = useState(false)
  const [inspectTitle, setInspectTitle] = useState('')
  const [inspectComponentId, setInspectComponentId] = useState('')
  const [inspectJsonText, setInspectJsonText] = useState('')
  const [inspectCodeText, setInspectCodeText] = useState('')
  const [inspectError, setInspectError] = useState<string | null>(null)
  const [inspectBusy, setInspectBusy] = useState(false)
  const [publishBlockId, setPublishBlockId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  const dragRef = useRef<{
    id: string
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const panRef = useRef<{
    startX: number
    startY: number
    originTx: number
    originTy: number
  } | null>(null)
  const blockRootsRef = useRef<Record<string, HTMLElement | null>>({})
  const viewportRef = useRef<HTMLDivElement>(null)
  const elementsRef = useRef(elements)
  elementsRef.current = elements

  useEffect(() => {
    persistLayoutSnapshot(elements)
  }, [elements])

  useEffect(() => {
    if (!selectedBlockId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedBlockId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedBlockId])

  const setBlockRoot = useCallback((id: string, el: HTMLElement | null) => {
    blockRootsRef.current[id] = el
  }, [])

  const onWheelStage = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.001
    setStage((s) => ({
      ...s,
      scale: clamp(s.scale * (1 + delta), STAGE_SCALE_MIN, STAGE_SCALE_MAX),
    }))
  }, [])

  const zoomIn = useCallback(() => {
    setStage((s) => ({
      ...s,
      scale: clamp(s.scale * STAGE_ZOOM_STEP, STAGE_SCALE_MIN, STAGE_SCALE_MAX),
    }))
  }, [])

  const zoomOut = useCallback(() => {
    setStage((s) => ({
      ...s,
      scale: clamp(s.scale / STAGE_ZOOM_STEP, STAGE_SCALE_MIN, STAGE_SCALE_MAX),
    }))
  }, [])

  const fitStageToViewport = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.width < 8 || r.height < 8) return
    setStage(
      fitStageToElements(elementsRef.current, r.width, r.height, 40),
    )
  }, [])

  const resetView = fitStageToViewport

  useLayoutEffect(() => {
    fitStageToViewport()
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver(() => fitStageToViewport())
    ro.observe(el)
    return () => ro.disconnect()
  }, [fitStageToViewport])

  const onPanPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    setSelectedBlockId(null)
    e.currentTarget.setPointerCapture(e.pointerId)
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originTx: stage.tx,
      originTy: stage.ty,
    }
  }

  const onPanPointerMove = (e: React.PointerEvent) => {
    const p = panRef.current
    if (!p) return
    const dx = e.clientX - p.startX
    const dy = e.clientY - p.startY
    setStage((s) => ({
      ...s,
      tx: p.originTx + dx,
      ty: p.originTy + dy,
    }))
  }

  const endPan = (e: React.PointerEvent) => {
    if (panRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      panRef.current = null
    }
  }

  const onPointerDownBlock = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (e.button !== 0) return
      const el = elements.find((x) => x.id === id)
      if (!el) return
      e.stopPropagation()
      setSelectedBlockId(id)
      e.currentTarget.setPointerCapture(e.pointerId)
      dragRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        originX: el.x,
        originY: el.y,
      }
    },
    [elements],
  )

  const onPointerMoveBlock = useCallback(
    (id: string, e: React.PointerEvent) => {
      const d = dragRef.current
      if (!d || d.id !== id) return
      const scale = stage.scale || 1
      const dx = (e.clientX - d.startX) / scale
      const dy = (e.clientY - d.startY) / scale
      setElements((prev) =>
        prev.map((item) =>
          item.id === d.id
            ? { ...item, x: d.originX + dx, y: d.originY + dy }
            : item,
        ),
      )
    },
    [stage.scale],
  )

  const endDragBlock = useCallback((id: string, e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d || d.id !== id) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    dragRef.current = null
  }, [])

  const closeInspectModal = useCallback(() => {
    setInspectOpen(false)
    setInspectTitle('')
    setInspectComponentId('')
    setInspectJsonText('')
    setInspectCodeText('')
    setInspectError(null)
    setInspectBusy(false)
  }, [])

  const runBlockInspect = async (el: CanvasElement) => {
    const root = blockRootsRef.current[el.id]
    if (!root) return
    const structure = createBlueprintStructure(root)
    const sourceHtml = serializeBlockHtml(root)
    const snippet = getBlockSourceSnippet(el.componentId)
    const parts: string[] = []
    if (snippet) {
      parts.push(
        `// TSX / source excerpt (componentId: ${el.componentId})\n${snippet.trim()}`,
      )
    }
    parts.push(`// Serialized HTML (sourceHtml for publish)\n${sourceHtml}`)
    const codeReady = parts.join('\n\n')

    setInspectOpen(true)
    setInspectTitle(el.label)
    setInspectComponentId(el.componentId)
    setInspectCodeText(codeReady)
    setInspectBusy(true)
    setInspectError(null)
    setInspectJsonText('')
    setBusyId(el.id)
    try {
      const res = await postBlueprintPreview({
        componentId: el.componentId,
        label: el.label,
        structure,
        sourceHtml,
      })
      setInspectJsonText(JSON.stringify(res.blueprint, null, 2))
    } catch (err) {
      setInspectError(err instanceof Error ? err.message : String(err))
    } finally {
      setInspectBusy(false)
      setBusyId(null)
    }
  }

  const runAutoCaptureForBlock = async (blockId: string) => {
    const root = blockRootsRef.current[blockId]
    if (!root) return
    setBusyId(blockId)
    try {
      const dataUrl = await captureElementFullPng(root)
      setPendingScreenshotByElement((m) => ({ ...m, [blockId]: dataUrl }))
      setPublishBlockId(blockId)
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
    } finally {
      setBusyId(null)
    }
  }

  const confirmPublish = async (opts: { description: string; sealed: boolean }) => {
    if (!publishBlockId) return
    const el = elements.find((x) => x.id === publishBlockId)
    const shot = pendingScreenshotByElement[publishBlockId]
    const root = blockRootsRef.current[publishBlockId]
    if (!el || !shot || !root) return
    setBusyId(publishBlockId)
    try {
      const structure = createBlueprintStructure(root)
      const sourceHtml = serializeBlockHtml(root)
      await postPublish({
        componentId: el.componentId,
        label: el.label,
        screenshot: shot,
        structure,
        description: opts.description || undefined,
        sealed: opts.sealed,
        sourceHtml,
      })
      setElements((prev) =>
        prev.map((b) =>
          b.id === publishBlockId ? { ...b, published: true } : b,
        ),
      )
      refreshCatalog()
      setPublishBlockId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
    } finally {
      setBusyId(null)
    }
  }

  const deleteBlock = useCallback(
    (id: string) => {
      persistDeletedId(id)
      delete blockRootsRef.current[id]
      if (dragRef.current?.id === id) dragRef.current = null
      setBusyId((cur) => (cur === id ? null : cur))
      setInspectOpen(false)
      setInspectTitle('')
      setInspectComponentId('')
      setInspectJsonText('')
      setInspectCodeText('')
      setInspectError(null)
      setInspectBusy(false)
      setElements((prev) => prev.filter((x) => x.id !== id))
      setPendingScreenshotByElement((m) => {
        const next = { ...m }
        delete next[id]
        return next
      })
      if (publishBlockId === id) setPublishBlockId(null)
      setSelectedBlockId((cur) => (cur === id ? null : cur))
    },
    [publishBlockId],
  )

  const transformStyle = {
    transform: `translate(${stage.tx}px, ${stage.ty}px) scale(${stage.scale})`,
    transformOrigin: '0 0',
  } as const

  return (
    <div className="flex h-full min-h-0 flex-col bg-brandcolor-fill">
      <header className="border-b border-brandcolor-strokeweak bg-brandcolor-white px-4 py-3 shadow-header">
        <h1 className="font-sans text-lg font-semibold text-brandcolor-textstrong">
          Admin canvas
        </h1>
      </header>

      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden bg-brandcolor-white"
        onWheel={onWheelStage}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,theme('colors.brandcolor-strokeweak')_1px,transparent_1px),linear-gradient(to_bottom,theme('colors.brandcolor-strokeweak')_1px,transparent_1px)] opacity-[0.45]"
          style={{ backgroundSize: `${CANVAS_GRID_PX}px ${CANVAS_GRID_PX}px` }}
          aria-hidden
        />
        <div
          className="absolute bottom-4 right-4 z-30 flex items-center gap-1 rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white p-1 shadow-card"
          onWheel={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            title="Zoom out"
            aria-label="Zoom out"
            onClick={zoomOut}
            className="flex h-9 w-9 items-center justify-center rounded-md text-lg font-medium text-brandcolor-textstrong hover:bg-brandcolor-neutralhover"
          >
            -
          </button>
          <button
            type="button"
            title="Fit all blocks in view"
            aria-label="Fit all blocks in view"
            onClick={resetView}
            className="min-w-[3.25rem] px-2 py-1.5 text-center text-xs font-medium text-brandcolor-textweak hover:bg-brandcolor-neutralhover hover:text-brandcolor-textstrong"
          >
            {Math.round(stage.scale * 100)}%
          </button>
          <button
            type="button"
            title="Zoom in"
            aria-label="Zoom in"
            onClick={zoomIn}
            className="flex h-9 w-9 items-center justify-center rounded-md text-lg font-medium text-brandcolor-textstrong hover:bg-brandcolor-neutralhover"
          >
            +
          </button>
        </div>
        <div className="relative z-[1] h-full w-full" style={transformStyle}>
          <div
            className="absolute left-0 top-0 z-[1] h-[1600px] w-[2400px] bg-transparent"
            data-pan-layer
            onPointerDown={onPanPointerDown}
            onPointerMove={onPanPointerMove}
            onPointerUp={endPan}
            onPointerCancel={endPan}
          />
          {elements.map((item) => {
            const hasShot = Boolean(pendingScreenshotByElement[item.id])
            const isSelected = selectedBlockId === item.id
            return (
              <div
                key={item.id}
                role="group"
                aria-label={`Canvas block: ${item.label}`}
                aria-selected={isSelected}
                className={`group/canvas-block absolute cursor-grab select-none rounded-lg bg-transparent transition-shadow duration-150 active:cursor-grabbing ${
                  isSelected
                    ? 'z-[50] ring-2 ring-brandcolor-banner-info-bg ring-offset-2 ring-offset-brandcolor-white'
                    : 'z-[2]'
                }`}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                }}
                onPointerDown={(e) => onPointerDownBlock(e, item.id)}
                onPointerMove={(e) => onPointerMoveBlock(item.id, e)}
                onPointerUp={(e) => endDragBlock(item.id, e)}
                onPointerCancel={(e) => endDragBlock(item.id, e)}
              >
                <div
                  role="toolbar"
                  aria-label={`Actions for ${item.label} (${item.componentId})`}
                  className={`absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-nowrap items-center gap-0.5 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-1 py-0.5 shadow-card transition-opacity duration-150 ${
                    isSelected
                      ? 'pointer-events-auto opacity-100'
                      : 'pointer-events-none opacity-0 group-hover/canvas-block:pointer-events-auto group-hover/canvas-block:opacity-100 group-focus-within/canvas-block:pointer-events-auto group-focus-within/canvas-block:opacity-100'
                  }`}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    title={`Inspect JSON & code — ${item.label} · id ${item.componentId}`}
                    aria-label={`Inspect blueprint and source for ${item.label}, component ${item.componentId}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      void runBlockInspect(item)
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-brandcolor-secondary hover:bg-brandcolor-secondaryfill disabled:opacity-50"
                  >
                    <IconPreview />
                  </button>
                  <button
                    type="button"
                    disabled={busyId !== null}
                    title={`Capture full block — ${item.label} · id ${item.componentId}`}
                    aria-label={`Capture full component for ${item.label}, component ${item.componentId}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      void runAutoCaptureForBlock(item.id)
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-brandcolor-secondary hover:bg-brandcolor-secondaryfill disabled:opacity-50"
                  >
                    <IconCapture />
                  </button>
                  <button
                    type="button"
                    title={`${item.published ? 'Update publish' : 'Publish'} — ${item.label} · id ${item.componentId}`}
                    aria-label={`${item.published ? 'Update publish' : 'Publish'} for ${item.label}, component ${item.componentId}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setPublishBlockId(item.id)
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-brandcolor-primary hover:bg-brandcolor-neutralhover"
                  >
                    <IconPublish />
                  </button>
                  <button
                    type="button"
                    title={`Delete — ${item.label} · id ${item.componentId}`}
                    aria-label={`Remove ${item.label}, component ${item.componentId}, from canvas`}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteBlock(item.id)
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-brandcolor-destructive hover:bg-brandcolor-banner-warning-bg"
                  >
                    <IconTrash />
                  </button>
                </div>
                {item.published ? (
                  <span className="pointer-events-none absolute right-2 top-2 z-[1] rounded bg-brandcolor-badge-success-bg px-1.5 py-0.5 text-[10px] font-medium text-brandcolor-badge-success-text">
                    Published
                  </span>
                ) : null}
                <div className="relative h-full min-h-0 w-full overflow-visible">
                  <BlockPreview
                    element={item}
                    setRoot={(el) => setBlockRoot(item.id, el)}
                  />
                </div>
                {!hasShot && (
                  <p
                    data-capture-only=""
                    className="pointer-events-none absolute bottom-1 left-2 text-[10px] text-brandcolor-destructive"
                  >
                    Screenshot required
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <CanvasBlockInspectModal
        open={inspectOpen}
        title={inspectTitle}
        componentId={inspectComponentId}
        jsonText={inspectJsonText}
        codeText={inspectCodeText}
        errorText={inspectError}
        busy={inspectBusy}
        onClose={closeInspectModal}
      />

      <CanvasPublishModal
        open={publishBlockId !== null}
        blockLabel={
          elements.find((b) => b.id === publishBlockId)?.label ?? ''
        }
        canPublish={
          publishBlockId
            ? Boolean(pendingScreenshotByElement[publishBlockId])
            : false
        }
        screenshotDataUrl={
          publishBlockId
            ? pendingScreenshotByElement[publishBlockId] ?? null
            : null
        }
        onClose={() => setPublishBlockId(null)}
        onConfirm={confirmPublish}
      />
    </div>
  )
}

function BlockPreview({
  element,
  setRoot,
}: {
  element: CanvasElement
  setRoot: (el: HTMLElement | null) => void
}) {
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      setRoot(node)
    },
    [setRoot],
  )

  if (element.type === 'button') {
    return (
      <div
        ref={ref}
        data-component-name={element.componentId}
        className="flex h-full items-center justify-center"
      >
        <button
          type="button"
          className="rounded-md bg-brandcolor-primary px-4 py-2 text-sm font-medium text-brandcolor-white hover:bg-brandcolor-primaryhover"
        >
          {element.label}
        </button>
      </div>
    )
  }

  if (element.type === 'article') {
    return (
      <AdminCanvasArticleCard
        ref={ref}
        componentId={element.componentId}
        title={element.label}
        subtitle={
          element.subtitle ??
          'Subtitle sits in text-strong for emphasis under the heading.'
        }
        paragraph={
          element.paragraph ??
          'Body paragraphs use text-weak for comfortable reading.'
        }
        paragraph2={element.paragraph2}
      />
    )
  }

  if (element.type === 'chart') {
    return (
      <div
        ref={ref}
        data-component-name={element.componentId}
        className={`flex h-full flex-col gap-2 p-3 ${THEME_CANVAS_BLOCK_SURFACE}`}
      >
        <div className="font-sans text-lg font-semibold text-brandcolor-textstrong">
          {element.label}
        </div>
        <div className="flex flex-1 items-end gap-1">
          {[40, 65, 45, 80, 55].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-brandcolor-secondary"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <AdminCanvasCardPreview
      ref={ref}
      componentId={element.componentId}
      title={element.label}
      subtitle={
        element.subtitle ??
        'Capture a screenshot region before publishing to the catalog.'
      }
      paragraph={
        element.paragraph ??
        'This card follows src/config/theme-guide.json: card surface, heading.h3 for the title, and text-weak copy for subtitle and body.'
      }
    />
  )
}

const THEME_ARTICLE_TITLE =
  'font-sans text-xl font-semibold text-brandcolor-textstrong'
const THEME_ARTICLE_SUBTITLE =
  'mt-2 text-sm font-semibold text-brandcolor-textstrong'

const AdminCanvasArticleCard = forwardRef(function AdminCanvasArticleCard(
  {
    componentId,
    title,
    subtitle,
    paragraph,
    paragraph2,
  }: {
    componentId: string
    title: string
    subtitle: string
    paragraph: string
    paragraph2?: string
  },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <article
      ref={ref}
      data-component-name={componentId}
      className={`flex h-full min-h-0 flex-col overflow-auto p-4 ${THEME_CANVAS_BLOCK_SURFACE}`}
    >
      <h2 className={THEME_ARTICLE_TITLE}>{title}</h2>
      <p className={THEME_ARTICLE_SUBTITLE}>{subtitle}</p>
      <p className={`mt-3 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{paragraph}</p>
      {paragraph2 ? (
        <p className={`mt-2 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{paragraph2}</p>
      ) : null}
    </article>
  )
})

const AdminCanvasCardPreview = forwardRef(function AdminCanvasCardPreview(
  {
    componentId,
    title,
    subtitle,
    paragraph,
  }: {
    componentId: string
    title: string
    subtitle: string
    paragraph: string
  },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      data-component-name={componentId}
      className={`flex h-full flex-col p-4 ${THEME_CANVAS_BLOCK_SURFACE}`}
    >
      <h3 className={THEME_GUIDE_HEADING_H3}>{title}</h3>
      <p className={`mt-2 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{subtitle}</p>
      <p className={`mt-2 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{paragraph}</p>
    </div>
  )
})
