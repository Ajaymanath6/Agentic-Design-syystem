import {
  RiCameraLine,
  RiCodeSSlashLine,
  RiDeleteBinLine,
  RiFullscreenLine,
  RiLoader4Line,
  RiZoomInLine,
  RiZoomOutLine,
} from '@remixicon/react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import { useCatalogRefresh } from '../../context/CatalogRefreshContext'
import { useCatalogCards } from '../../hooks/useCatalogCards'
import { captureElementFullPng } from '../../lib/capture-screenshot'
import {
  buildBlueprintPreviewDocument,
  buildSourceHtmlForCanvasNode,
  type CanvasNode,
  publishLabelForCanvasNode,
  componentCatalogIdForCanvasNode,
} from '../../lib/canvas-node-publish'
import { isCatalogLayoutEntry } from '../../lib/catalog-layout-entry'
import { postDeleteComponent, postPublish } from '../../services/publish-workflow'
import { CanvasPublishModal } from './CanvasPublishModal'

const GRID_PX = 24
/** Viewport-fixed grid (#F5F5F5 fill + lines); world pans/zooms on top. */
const GRID_LINE = '#D0D0D0'
const VIEWPORT_GRID_STYLE: CSSProperties = {
  backgroundColor: '#F5F5F5',
  backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
  backgroundSize: `${GRID_PX}px ${GRID_PX}px`,
}

const WORLD_W = 3200
const WORLD_H = 2400
const SCALE_MIN = 0.2
const SCALE_MAX = 2.5
const ZOOM_STEP = 1.12

/** Content width; fitView uses same footprint (see theme-guide componentsCanvasCard). */
const CANVAS_CARD_W = 280
const CANVAS_CARD_H = 200
const CANVAS_PRIMARY_W = 220
const CANVAS_PRIMARY_H = 112

function nodeSize(n: CanvasNode): { w: number; h: number } {
  return n.kind === 'primaryButton'
    ? { w: CANVAS_PRIMARY_W, h: CANVAS_PRIMARY_H }
    : { w: CANVAS_CARD_W, h: CANVAS_CARD_H }
}

function createInitialCanvasCard(): CanvasNode {
  return {
    kind: 'card',
    id: crypto.randomUUID(),
    x: WORLD_W / 2 - CANVAS_CARD_W / 2,
    y: WORLD_H / 2 - 140,
    title: 'Canvas card',
    subtitle: 'Subtitle for context',
    body: 'Paragraph text uses text-brandcolor-textweak with relaxed leading. Drag this card anywhere on the canvas.',
  }
}

function createInitialPrimaryButton(): CanvasNode {
  return {
    kind: 'primaryButton',
    id: crypto.randomUUID(),
    x: WORLD_W / 2 - CANVAS_PRIMARY_W / 2,
    y: WORLD_H / 2 + 80,
    label: 'Primary button',
  }
}

function newCanvasNodeAtWorld(
  wx: number,
  wy: number,
  cardIndex: number,
): CanvasNode {
  return {
    kind: 'card',
    id: crypto.randomUUID(),
    x: wx - CANVAS_CARD_W / 2,
    y: wy - 72,
    title: `Card ${cardIndex}`,
    subtitle: 'Subtitle',
    body: 'Body copy — same weak tone as the subtitle, for readable canvas blocks.',
  }
}

function newPrimaryButtonAtWorld(wx: number, wy: number): CanvasNode {
  return {
    kind: 'primaryButton',
    id: crypto.randomUUID(),
    x: wx - CANVAS_PRIMARY_W / 2,
    y: wy - CANVAS_PRIMARY_H / 2,
    label: 'Primary button',
  }
}

const CANVAS_NODES_STORAGE_KEY = 'agentic-components-canvas-nodes-v1'

function parseStoredCanvasNode(
  o: Record<string, unknown>,
): CanvasNode | null {
  if (
    typeof o.id !== 'string' ||
    typeof o.x !== 'number' ||
    typeof o.y !== 'number'
  ) {
    return null
  }
  if (o.kind === 'primaryButton') {
    if (typeof o.label !== 'string') return null
    return {
      kind: 'primaryButton',
      id: o.id,
      x: o.x,
      y: o.y,
      label: o.label,
    }
  }
  if (
    o.kind === 'card' ||
    o.kind === undefined ||
    o.kind === null
  ) {
    if (
      typeof o.title === 'string' &&
      typeof o.subtitle === 'string' &&
      typeof o.body === 'string'
    ) {
      return {
        kind: 'card',
        id: o.id,
        x: o.x,
        y: o.y,
        title: o.title,
        subtitle: o.subtitle,
        body: o.body,
      }
    }
  }
  return null
}

function ensureCanvasHasPrimaryButton(nodes: CanvasNode[]): CanvasNode[] {
  if (nodes.some((n) => n.kind === 'primaryButton')) return nodes
  return [...nodes, createInitialPrimaryButton()]
}

function loadCanvasNodesFromStorage(): CanvasNode[] | null {
  try {
    const raw = localStorage.getItem(CANVAS_NODES_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data) || data.length === 0) return null
    const out: CanvasNode[] = []
    for (const row of data) {
      if (!row || typeof row !== 'object') return null
      const parsed = parseStoredCanvasNode(row as Record<string, unknown>)
      if (!parsed) return null
      out.push(parsed)
    }
    return out
  } catch {
    return null
  }
}

function persistCanvasNodesToStorage(nodes: CanvasNode[]) {
  try {
    localStorage.setItem(CANVAS_NODES_STORAGE_KEY, JSON.stringify(nodes))
  } catch {
    /* quota / private mode */
  }
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function zoomTowardPoint(
  tx: number,
  ty: number,
  scale: number,
  mx: number,
  my: number,
  nextScale: number,
) {
  const s0 = scale || 1
  const s1 = clamp(nextScale, SCALE_MIN, SCALE_MAX)
  if (s0 <= 0) return { tx, ty, scale: s1 }
  const ratio = s1 / s0
  return {
    scale: s1,
    tx: mx - (mx - tx) * ratio,
    ty: my - (my - ty) * ratio,
  }
}

const toolbarBtn =
  'inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold text-brandcolor-textstrong transition-colors hover:bg-brandcolor-white'

const zoomBarIconBtn =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-brandcolor-textstrong hover:bg-brandcolor-neutralhover'

/** Wrapper + bubble: same chrome as add-block tooltip (no native `title`). */
const canvasTipWrap = 'group/canvas-tip relative inline-flex shrink-0'
const canvasTipWrapGrow =
  'group/canvas-tip relative flex min-w-0 flex-1 basis-0'
const canvasTipAbove =
  'canvas-element-tooltip bottom-full left-1/2 z-30 mb-1 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover/canvas-tip:opacity-100'
const canvasTipBelow =
  'canvas-element-tooltip top-full left-1/2 z-30 mt-1 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover/canvas-tip:opacity-100'

/** Published = in catalog; use brand orange (not success green). */
const publishedBadgeClass =
  'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-brandcolor-banner-warning-bg text-brandcolor-primary ring-1 ring-brandcolor-primary/25'
const draftBadgeClass =
  'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-brandcolor-fill text-brandcolor-textweak ring-1 ring-brandcolor-strokeweak'

/** Canvas: grid on viewport; pan/dblclick on stage empty area — Space+drag or middle mouse. */
export function ComponentsCanvasSurface() {
  const { refreshCatalog } = useCatalogRefresh()
  const { cards } = useCatalogCards()
  const publishedCatalogIds = useMemo(() => {
    const next = new Set<string>()
    for (const c of cards) {
      if (!isCatalogLayoutEntry(c.entry)) {
        next.add(c.entry.id)
      }
    }
    return next
  }, [cards])
  const [nodes, setNodes] = useState<CanvasNode[]>(() => {
    const stored = loadCanvasNodesFromStorage()
    if (stored != null && stored.length > 0) {
      return ensureCanvasHasPrimaryButton(stored)
    }
    return [createInitialCanvasCard(), createInitialPrimaryButton()]
  })
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [scale, setScale] = useState(0.55)
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [codeFor, setCodeFor] = useState<CanvasNode | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishTarget, setPublishTarget] = useState<CanvasNode | null>(null)
  const publishTargetRef = useRef<CanvasNode | null>(null)
  publishTargetRef.current = publishTarget
  const [publishScreenshot, setPublishScreenshot] = useState<string | null>(null)
  const [publishBusy, setPublishBusy] = useState(false)
  const [captureBusyId, setCaptureBusyId] = useState<string | null>(null)
  /** World node id while primary drag is active — drives primary-block selection ring only. */
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  /** While set, toolbar + catalog badge are hidden so capture/modal show only card content. */
  const [capturingHideChromeId, setCapturingHideChromeId] = useState<
    string | null
  >(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const cardRootRefs = useRef<Map<string, HTMLElement>>(new Map())
  const spaceDownRef = useRef(false)
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes

  useEffect(() => {
    const t = window.setTimeout(() => persistCanvasNodesToStorage(nodes), 400)
    return () => window.clearTimeout(t)
  }, [nodes])

  const stageRef = useRef({ tx, ty, scale })
  stageRef.current = { tx, ty, scale }
  const panRef = useRef<{
    startX: number
    startY: number
    originTx: number
    originTy: number
  } | null>(null)
  const dragRef = useRef<{
    id: string
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const didInitialFitRef = useRef(false)
  const didCenterViewportRef = useRef(false)

  const fitView = useCallback(() => {
    const el = viewportRef.current
    const list = nodesRef.current
    if (!el) return
    if (list.length === 0) {
      const r = el.getBoundingClientRect()
      const s = clamp(
        Math.min((r.width - 96) / WORLD_W, (r.height - 96) / WORLD_H),
        SCALE_MIN,
        0.85,
      )
      const cx = WORLD_W / 2
      const cy = WORLD_H / 2
      setScale(s)
      setTx(r.width / 2 - cx * s)
      setTy(r.height / 2 - cy * s)
      return
    }
    const r = el.getBoundingClientRect()
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const n of list) {
      const { w: bw, h: bh } = nodeSize(n)
      minX = Math.min(minX, n.x)
      minY = Math.min(minY, n.y)
      maxX = Math.max(maxX, n.x + bw)
      maxY = Math.max(maxY, n.y + bh)
    }
    const cw = maxX - minX + 80
    const ch = maxY - minY + 80
    const pad = 48
    const s = clamp(
      Math.min((r.width - pad * 2) / cw, (r.height - pad * 2) / ch),
      SCALE_MIN,
      SCALE_MAX,
    )
    setScale(s)
    setTx((r.width - cw * s) / 2 - minX * s + pad * 0.5)
    setTy((r.height - ch * s) / 2 - minY * s + pad * 0.5)
  }, [])

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el || didCenterViewportRef.current) return
    didCenterViewportRef.current = true
    const r = el.getBoundingClientRect()
    const s = clamp(
      Math.min((r.width - 96) / WORLD_W, (r.height - 96) / WORLD_H),
      SCALE_MIN,
      0.85,
    )
    const cx = WORLD_W / 2
    const cy = WORLD_H / 2
    setScale(s)
    setTx(r.width / 2 - cx * s)
    setTy(r.height / 2 - cy * s)
  }, [])

  useLayoutEffect(() => {
    if (nodes.length === 0) {
      didInitialFitRef.current = false
      return
    }
    if (!didInitialFitRef.current) {
      didInitialFitRef.current = true
      fitView()
    }
  }, [nodes.length, fitView])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const t = e.target as HTMLElement
        if (t.closest('input, textarea, [contenteditable="true"], button')) return
        e.preventDefault()
        spaceDownRef.current = true
        setSpaceHeld(true)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceDownRef.current = false
        setSpaceHeld(false)
      }
    }
    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('keyup', onKeyUp, { capture: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('keyup', onKeyUp, { capture: true })
    }
  }, [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const mx = e.clientX - r.left
      const my = e.clientY - r.top
      let delta = -e.deltaY
      if (e.deltaMode === 1) delta *= 16
      if (e.deltaMode === 2) delta *= r.height
      const factor = Math.exp(delta * 0.0011)
      const st = stageRef.current
      const z = zoomTowardPoint(st.tx, st.ty, st.scale, mx, my, st.scale * factor)
      setTx(z.tx)
      setTy(z.ty)
      setScale(z.scale)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  /** Grid is not pannable with primary button — only Space+primary or middle mouse (Figma-style). */
  const onPanPointerDown = (e: ReactPointerEvent) => {
    const middle = e.button === 1
    const spacePan = e.button === 0 && spaceDownRef.current
    if (!middle && !spacePan) return
    if (middle) e.preventDefault()
    e.stopPropagation()
    try {
      viewportRef.current?.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    const st = stageRef.current
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originTx: st.tx,
      originTy: st.ty,
    }
  }

  const onPanPointerMove = (e: ReactPointerEvent) => {
    const p = panRef.current
    if (!p) return
    const dx = e.clientX - p.startX
    const dy = e.clientY - p.startY
    setTx(p.originTx + dx)
    setTy(p.originTy + dy)
  }

  const endPan = (e: ReactPointerEvent) => {
    if (!panRef.current) return
    try {
      viewportRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    panRef.current = null
  }

  const onNodeBodyPointerDown = (e: ReactPointerEvent, id: string) => {
    if (e.button !== 0) return
    if (spaceDownRef.current) return
    e.stopPropagation()
    const n = nodesRef.current.find((x) => x.id === id)
    if (!n) return
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      originX: n.x,
      originY: n.y,
    }
    setDraggingNodeId(id)
  }

  const onNodePointerMove = (e: ReactPointerEvent, id: string) => {
    const d = dragRef.current
    if (!d || d.id !== id) return
    const s = stageRef.current.scale || 1
    const dx = (e.clientX - d.startX) / s
    const dy = (e.clientY - d.startY) / s
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, x: d.originX + dx, y: d.originY + dy } : n,
      ),
    )
  }

  const endNodeDrag = (e: ReactPointerEvent, id: string) => {
    const d = dragRef.current
    if (!d || d.id !== id) return
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    dragRef.current = null
    setDraggingNodeId(null)
  }

  const worldDoubleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return
    const st = stageRef.current
    const vx = e.clientX - rect.left
    const vy = e.clientY - rect.top
    const wx = (vx - st.tx) / st.scale
    const wy = (vy - st.ty) / st.scale
    if (e.shiftKey) {
      setNodes((prev) => [...prev, newPrimaryButtonAtWorld(wx, wy)])
      return
    }
    setNodes((prev) => [
      ...prev,
      newCanvasNodeAtWorld(
        wx,
        wy,
        prev.filter((x) => x.kind === 'card').length + 1,
      ),
    ])
  }

  const closePublishModal = useCallback(() => {
    setPublishOpen(false)
    setPublishScreenshot(null)
    setPublishTarget(null)
  }, [])

  const handleCapture = useCallback(async (n: CanvasNode) => {
    const el = cardRootRefs.current.get(n.id)
    if (!el) {
      alert('Block is not ready for capture.')
      return
    }
    setCapturingHideChromeId(n.id)
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
    setCaptureBusyId(n.id)
    try {
      const dataUrl = await captureElementFullPng(el)
      setPublishTarget(n)
      setPublishScreenshot(dataUrl)
      setPublishOpen(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
    } finally {
      setCapturingHideChromeId(null)
      setCaptureBusyId(null)
    }
  }, [])

  const confirmPublish = useCallback(
    async (opts: { description: string; sealed: boolean }) => {
      if (!publishScreenshot || !publishTarget) return
      setPublishBusy(true)
      try {
        // Same componentId as catalog entry id — server mergeCatalogEntry updates in place (no duplicate row).
        await postPublish({
          componentId: componentCatalogIdForCanvasNode(publishTarget),
          label: publishLabelForCanvasNode(publishTarget),
          screenshot: publishScreenshot,
          sourceHtml: buildSourceHtmlForCanvasNode(publishTarget),
          description: opts.description || undefined,
          sealed: opts.sealed,
          kind: 'component',
        })
        refreshCatalog()
        closePublishModal()
      } catch (err) {
        alert(err instanceof Error ? err.message : String(err))
      } finally {
        setPublishBusy(false)
      }
    },
    [
      publishScreenshot,
      publishTarget,
      refreshCatalog,
      closePublishModal,
    ],
  )

  const handleDelete = useCallback(
    (id: string) => {
      const removed = nodesRef.current.find((x) => x.id === id)
      setNodes((prev) => prev.filter((x) => x.id !== id))
      setCodeFor((cur) => (cur?.id === id ? null : cur))
      if (publishTargetRef.current?.id === id) {
        setPublishOpen(false)
        setPublishScreenshot(null)
        setPublishTarget(null)
      }
      if (removed) {
        const catalogId = componentCatalogIdForCanvasNode(removed)
        void postDeleteComponent(catalogId)
          .then(() => refreshCatalog())
          .catch((err) => {
            alert(err instanceof Error ? err.message : String(err))
          })
      }
    },
    [refreshCatalog],
  )

  useEffect(() => {
    if (!publishTarget) return
    if (!nodes.some((n) => n.id === publishTarget.id)) {
      closePublishModal()
    }
  }, [nodes, publishTarget, closePublishModal])

  const zoomIn = () => {
    const el = viewportRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const st = stageRef.current
    const z = zoomTowardPoint(
      st.tx,
      st.ty,
      st.scale,
      r.width / 2,
      r.height / 2,
      st.scale * ZOOM_STEP,
    )
    setTx(z.tx)
    setTy(z.ty)
    setScale(z.scale)
  }

  const zoomOut = () => {
    const el = viewportRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const st = stageRef.current
    const z = zoomTowardPoint(
      st.tx,
      st.ty,
      st.scale,
      r.width / 2,
      r.height / 2,
      st.scale / ZOOM_STEP,
    )
    setTx(z.tx)
    setTy(z.ty)
    setScale(z.scale)
  }

  const transformStyle = {
    transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
    transformOrigin: '0 0',
    willChange: 'transform',
  } as const

  return (
    <div className="relative flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-brandcolor-fill">
      {codeFor ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="canvas-code-title"
          onClick={() => setCodeFor(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white p-4 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="canvas-code-title"
              className="font-sans text-sm font-semibold text-brandcolor-textstrong"
            >
              Code — {publishLabelForCanvasNode(codeFor)}
            </h2>
            <p className="mt-1 text-xs text-brandcolor-textweak">
              Source HTML matches what publish sends as{' '}
              <code className="rounded bg-brandcolor-fill px-1">sourceHtml</code>. JSON matches the
              saved blueprint shape (thumbnail path is a placeholder until you capture).
            </p>
            <h3 className="mt-4 font-sans text-xs font-semibold uppercase tracking-wide text-brandcolor-textweak">
              Source HTML
            </h3>
            <pre className="mt-1 max-h-[28vh] overflow-auto rounded-md border border-brandcolor-strokeweak bg-brandcolor-fill p-3 font-mono text-[11px] leading-relaxed text-brandcolor-textstrong">
              {buildSourceHtmlForCanvasNode(codeFor)}
            </pre>
            <h3 className="mt-4 font-sans text-xs font-semibold uppercase tracking-wide text-brandcolor-textweak">
              Blueprint JSON (preview)
            </h3>
            <pre className="mt-1 max-h-[36vh] overflow-auto rounded-md border border-brandcolor-strokeweak bg-brandcolor-fill p-3 font-mono text-[11px] leading-relaxed text-brandcolor-textstrong">
              {JSON.stringify(buildBlueprintPreviewDocument(codeFor), null, 2)}
            </pre>
            <button
              type="button"
              className="mt-4 rounded-md border border-brandcolor-strokeweak px-3 py-1.5 text-sm font-medium text-brandcolor-textstrong hover:bg-brandcolor-fill"
              onClick={() => setCodeFor(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <CanvasPublishModal
        open={publishOpen}
        blockLabel={
          publishTarget ? publishLabelForCanvasNode(publishTarget) : ''
        }
        canPublish={Boolean(publishScreenshot)}
        screenshotDataUrl={publishScreenshot}
        onClose={closePublishModal}
        onConfirm={confirmPublish}
        submitBusy={publishBusy}
      />

      <div
        className="absolute bottom-4 right-4 z-30 flex items-center gap-0.5 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white p-0.5 shadow-card"
        onWheel={(e) => e.stopPropagation()}
        role="toolbar"
        aria-label="Canvas zoom"
      >
        <span className={canvasTipWrap}>
          <span className={canvasTipAbove} role="tooltip">
            Zoom out
          </span>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={zoomOut}
            className={zoomBarIconBtn}
          >
            <RiZoomOutLine className="size-4" aria-hidden />
          </button>
        </span>
        <span
          className="min-w-[2.25rem] px-1 text-center text-[10px] font-medium tabular-nums text-brandcolor-textweak"
          aria-live="polite"
        >
          {Math.round(scale * 100)}%
        </span>
        <span className={canvasTipWrap}>
          <span className={canvasTipAbove} role="tooltip">
            Zoom in
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={zoomIn}
            className={zoomBarIconBtn}
          >
            <RiZoomInLine className="size-4" aria-hidden />
          </button>
        </span>
        <span className={canvasTipWrap}>
          <span className={canvasTipAbove} role="tooltip">
            Fit view
          </span>
          <button
            type="button"
            aria-label="Fit view"
            onClick={fitView}
            className={zoomBarIconBtn}
          >
          <RiFullscreenLine className="size-4" aria-hidden />
          </button>
        </span>
      </div>

      <div
        ref={viewportRef}
        className={`relative z-[1] min-h-0 flex-1 overflow-hidden ${
          spaceHeld ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{ touchAction: 'none', ...VIEWPORT_GRID_STYLE }}
        aria-label="Canvas — double-click empty grid for a card, Shift-double-click for a primary button; drag blocks to move; Space or middle mouse to pan"
        data-canvas-viewport
        onPointerMove={(e) => {
          if (panRef.current) onPanPointerMove(e)
        }}
        onPointerUp={(e) => {
          if (panRef.current) endPan(e)
        }}
        onPointerCancel={(e) => {
          if (panRef.current) endPan(e)
        }}
      >
        <div
          className="absolute inset-0"
          style={transformStyle}
          onPointerDown={onPanPointerDown}
          onDoubleClick={worldDoubleClick}
        >
          {nodes.map((n) => {
            const published = publishedCatalogIds.has(
              componentCatalogIdForCanvasNode(n),
            )
            const toolbarLabel = publishLabelForCanvasNode(n)
            const blockWidth =
              n.kind === 'primaryButton' ? CANVAS_PRIMARY_W : CANVAS_CARD_W

            return (
              <div
                key={n.id}
                ref={(el) => {
                  const m = cardRootRefs.current
                  if (el) m.set(n.id, el)
                  else m.delete(n.id)
                }}
                className={
                  n.kind === 'primaryButton'
                    ? `group absolute z-[2] min-w-0 overflow-hidden rounded-lg bg-brandcolor-white shadow-card ${
                        draggingNodeId === n.id
                          ? 'border-2 border-brandcolor-primary ring-2 ring-brandcolor-primary/25'
                          : 'border border-brandcolor-strokeweak ring-0'
                      }`
                    : 'group absolute z-[2] min-w-0 overflow-hidden rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white shadow-card'
                }
                style={{ left: n.x, top: n.y, width: blockWidth }}
              >
                <div
                  className={`flex items-center gap-0.5 overflow-visible border-b border-transparent bg-brandcolor-fill px-1 transition-[max-height,opacity,padding] duration-150 ${
                    capturingHideChromeId === n.id
                      ? 'max-h-0 border-0 py-0 opacity-0'
                      : 'max-h-0 py-0 opacity-0 group-hover:max-h-10 group-hover:border-brandcolor-strokeweak group-hover:py-1 group-hover:opacity-100'
                  }`}
                  data-canvas-card-toolbar
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <span className={canvasTipWrapGrow}>
                    <span
                      className={`${canvasTipBelow} max-w-[min(100%,14rem)]`}
                      role="tooltip"
                    >
                      {toolbarLabel}
                    </span>
                    <span className="min-w-0 flex-1 truncate px-0.5 text-[11px] font-semibold text-brandcolor-textstrong">
                      {toolbarLabel}
                    </span>
                  </span>
                  <span className={canvasTipWrap}>
                    <span className={canvasTipBelow} role="tooltip">
                      Capture thumbnail and publish
                      <span className="canvas-element-tooltip-detail">
                        Opens publish flow for this block
                      </span>
                    </span>
                    <button
                      type="button"
                      className={toolbarBtn}
                      aria-label={`Capture ${toolbarLabel}`}
                      disabled={captureBusyId === n.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        void handleCapture(n)
                      }}
                    >
                      {captureBusyId === n.id ? (
                        <RiLoader4Line
                          className="size-3.5 shrink-0 animate-spin"
                          aria-hidden
                        />
                      ) : (
                        <RiCameraLine className="size-3.5 shrink-0" aria-hidden />
                      )}
                      Capture
                    </button>
                  </span>
                  <span className={canvasTipWrap}>
                    <span className={canvasTipBelow} role="tooltip">
                      Source HTML and blueprint JSON for this block
                    </span>
                    <button
                      type="button"
                      className={toolbarBtn}
                      aria-label={`Code for ${toolbarLabel}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCodeFor(n)
                      }}
                    >
                      <RiCodeSSlashLine className="size-3.5 shrink-0" aria-hidden />
                      Code
                    </button>
                  </span>
                  <span className={canvasTipWrap}>
                    <span className={canvasTipBelow} role="tooltip">
                      Remove from canvas and delete catalog entry if published
                    </span>
                    <button
                      type="button"
                      className={`${toolbarBtn} text-brandcolor-destructive hover:bg-brandcolor-banner-warning-bg`}
                      aria-label={`Delete ${toolbarLabel}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(n.id)
                      }}
                    >
                      <RiDeleteBinLine className="size-3.5 shrink-0" aria-hidden />
                      Delete
                    </button>
                  </span>
                </div>
                {n.kind === 'primaryButton' ? (
                  <div
                    className="group/canvas-primary cursor-grab px-3 py-3 active:cursor-grabbing"
                    onPointerDown={(e) => onNodeBodyPointerDown(e, n.id)}
                    onPointerMove={(e) => onNodePointerMove(e, n.id)}
                    onPointerUp={(e) => endNodeDrag(e, n.id)}
                    onPointerCancel={(e) => endNodeDrag(e, n.id)}
                  >
                    <div className="mb-2 flex items-start justify-end gap-2">
                      {capturingHideChromeId !== n.id ? (
                        <span
                          className={
                            published ? publishedBadgeClass : draftBadgeClass
                          }
                          data-canvas-catalog-badge
                          aria-label={
                            published
                              ? 'Published to catalog — republishing updates the same entry'
                              : 'Not in catalog yet — publish from Capture'
                          }
                        >
                          {published ? 'Published' : 'Not published'}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="primary-canvas-button pointer-events-none w-full select-none px-4 py-2.5 text-sm font-semibold"
                      tabIndex={-1}
                      aria-hidden
                    >
                      {n.label}
                    </button>
                  </div>
                ) : (
                  <div
                    className="cursor-grab px-3 py-3 active:cursor-grabbing"
                    onPointerDown={(e) => onNodeBodyPointerDown(e, n.id)}
                    onPointerMove={(e) => onNodePointerMove(e, n.id)}
                    onPointerUp={(e) => endNodeDrag(e, n.id)}
                    onPointerCancel={(e) => endNodeDrag(e, n.id)}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="min-w-0 flex-1 font-sans text-base font-semibold text-brandcolor-textstrong">
                        {n.title}
                      </h3>
                      {capturingHideChromeId !== n.id ? (
                        <span
                          className={
                            published ? publishedBadgeClass : draftBadgeClass
                          }
                          data-canvas-catalog-badge
                          aria-label={
                            published
                              ? 'Published to catalog — republishing this block updates the same catalog entry'
                              : 'Not in catalog yet — publish from Capture to add or update'
                          }
                        >
                          {published ? 'Published' : 'Not published'}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-brandcolor-textweak">
                      {n.subtitle}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-brandcolor-textweak">
                      {n.body}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default ComponentsCanvasSurface
