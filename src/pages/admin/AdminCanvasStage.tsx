import {
  forwardRef,
  type CSSProperties,
  type ForwardedRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { getBlockSourceSnippet } from '../../canvas/block-source-snippets'
import { CanvasBlockInspectModal } from '../../components/canvas/CanvasBlockInspectModal'
import { CanvasPublishModal } from '../../components/canvas/CanvasPublishModal'
import { useCatalogRefresh } from '../../context/CatalogRefreshContext'
import { captureElementFullPng } from '../../lib/capture-screenshot'
import { fetchCatalogIndex } from '../../services/catalog-reader'
import { createBlueprintStructure } from '../../lib/blueprint-from-dom'
import { serializeBlockHtml } from '../../lib/serialize-block-html'
import { RiMore2Line, RiPriceTag3Line, RiShareLine } from '@remixicon/react'
import {
  postBlueprintPreview,
  postDeleteComponent,
  postPublish,
} from '../../services/publish-workflow'
import {
  ADMIN_CANVAS_DELETED_IDS_KEY,
  ADMIN_CANVAS_LAYOUT_KEY,
  type CanvasElement,
} from '../../types/canvas'

type StageState = { tx: number; ty: number; scale: number }

const STAGE_SCALE_MIN = 0.25
const STAGE_SCALE_MAX = 2.5
/** Fit-to-view never zooms in past this (45% = more canvas visible; still shrinks if needed to fit). */
const DEFAULT_CANVAS_FIT_MAX_SCALE = 0.45
/** Bump when scene ids or default layout change so stale localStorage does not hide new blocks. */
const ADMIN_CANVAS_SCENE_REVISION = 8
const ADMIN_CANVAS_SCENE_REVISION_KEY = 'admin-canvas-v2-scene-revision'
/** Session fingerprint of scene block ids — when it changes, catalog consumers refresh. */
const ADMIN_CANVAS_SCENE_IDS_SESSION_KEY = 'admin-canvas-v2-scene-ids'
const STAGE_ZOOM_STEP = 1.12
const STAGE_ANIM_MS = 220
const CANVAS_GRID_PX = 24
const CANVAS_WORLD_W = 2400
const CANVAS_WORLD_H = 1680
/** Inline grid so Tailwind arbitrary `theme()` in gradients does not strip the pattern. */
const CANVAS_GRID_BG_STYLE: CSSProperties = {
  backgroundImage: `linear-gradient(to right, #DDDDDD 1px, transparent 1px), linear-gradient(to bottom, #DDDDDD 1px, transparent 1px)`,
  backgroundSize: `${CANVAS_GRID_PX}px ${CANVAS_GRID_PX}px`,
}

/** From `src/config/theme-guide.json` → componentGuidelines.heading.h1 (promo hero) */
const THEME_GUIDE_HEADING_H1 =
  'font-sans text-3xl font-semibold tracking-tight text-brandcolor-textstrong c_md:text-4xl'
/** From `src/config/theme-guide.json` → componentGuidelines.heading.h2 (profile name) */
const THEME_GUIDE_HEADING_H2 =
  'font-sans text-xl font-semibold text-brandcolor-textstrong c_md:text-2xl'
/** From `src/config/theme-guide.json` → componentGuidelines.heading.h3 */
const THEME_GUIDE_HEADING_H3 =
  'font-sans text-lg font-semibold text-brandcolor-textstrong'
/** theme-guide.json → profileCard.iconButton */
const PROFILE_ICON_BTN =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-brandcolor-textstrong hover:bg-brandcolor-fill active:border active:border-brandcolor-strokeweak focus:outline-none focus-visible:border focus-visible:border-brandcolor-strokeweak'
/** Body / supporting copy: `text-sm` + `text-brandcolor-textweak` (aligned with input body scale) */
const THEME_GUIDE_TEXT_WEAK_BODY = 'text-sm leading-relaxed text-brandcolor-textweak'
/** From `src/config/theme-guide.json` → componentGuidelines.button.primary (bg primary, label text white) */
const THEME_GUIDE_BUTTON_PRIMARY =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-brandcolor-white bg-brandcolor-primary hover:bg-brandcolor-primaryhover active:shadow-button-press focus:outline-none focus:ring-0'

/** White card surface per theme-guide; selection ring is light blue on the canvas wrapper. */
const THEME_CANVAS_BLOCK_SURFACE =
  'rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white shadow-card'

/** Inner padding for block previews (e.g. case-card root); matches catalog Code/JSON inset. */
const CANVAS_BLOCK_INSET = 'p-[48px]'

/**
 * Authoritative canvas document: edit this list to add blocks or change defaults.
 * Delete on canvas persists (localStorage); clear `admin-canvas-v2-deleted-ids` to restore removed blocks.
 * Scene revision bumps reset saved positions only, not your delete list.
 * `BlockPreview` renders `type` (`button` | `card` | `promo` | `plain` | `chart` | `authNameField` | `authPasswordField` | …).
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
    id: 'blk-primary-button-alt',
    componentId: 'primary-button-alt',
    type: 'button',
    label: 'Get started',
    x: 288,
    y: 32,
    width: 200,
    height: 88,
    published: false,
  },
  {
    id: 'blk-promo-card',
    componentId: 'promo-card',
    type: 'promo',
    label: 'Promo card',
    promoHeadline: 'Ship consistent UI from one catalog',
    promoSubtitle:
      'Design tokens, live previews, and production components stay aligned so teams move faster.',
    secondaryHeading: 'What you get',
    secondarySubtitle:
      'A single place to browse, inspect, and publish blocks with blueprint-backed previews.',
    paragraph:
      'Promo cards lead with a strong headline and supporting line, then introduce a second heading and subtitle before longer body copy.',
    paragraph2:
      'Use this pattern for landing sections, feature callouts, or onboarding highlights on the canvas.',
    x: 400,
    y: 32,
    width: 360,
    height: 400,
    published: false,
  },
  {
    id: 'blk-plain-card-single',
    componentId: 'plain-card-single',
    type: 'plain',
    label: 'Plain card',
    paragraph:
      'Plain card: theme surface with a single paragraph only — no title or subtitle.',
    x: 400,
    y: 448,
    width: 320,
    height: 120,
    published: false,
  },
  {
    id: 'blk-plain-card-dual',
    componentId: 'plain-card-dual',
    type: 'plain',
    label: 'Paragraph card',
    paragraph:
      'First paragraph: plain body copy on the standard card surface, no headings.',
    paragraph2:
      'Second paragraph: same weak body style for stacked supporting text.',
    x: 400,
    y: 584,
    width: 320,
    height: 168,
    published: false,
  },
  {
    id: 'blk-profile-card',
    componentId: 'profile-card',
    type: 'profile',
    label: 'Profile card',
    personName: 'Jordan Lee',
    subtitle: 'Design systems lead',
    paragraph:
      'Owns tokens, documentation, and Figma parity so product teams ship consistent UI without rework.',
    paragraph2:
      'Previously built design ops at two growth-stage companies; based in Berlin.',
    x: 32,
    y: 136,
    width: 360,
    height: 248,
    published: false,
  },
  {
    id: 'blk-case-card',
    componentId: 'case-card',
    type: 'case',
    label: 'Onboarding refresh',
    subtitle: 'Reduce signup drop-off in the first session',
    paragraph:
      'Case summary: we shortened the path from account creation to first value, aligned copy with research findings, and validated with a staged rollout.',
    x: 32,
    y: 400,
    width: 360,
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
    y: 636,
    width: 360,
    height: 280,
    published: false,
  },
  {
    id: 'blk-demo-canvas-name',
    componentId: 'demo-canvas-name',
    type: 'authNameField',
    label: 'Name field',
    x: 32,
    y: 928,
    width: 320,
    height: 96,
    published: false,
  },
  {
    id: 'blk-demo-canvas-password',
    componentId: 'demo-canvas-password',
    type: 'authPasswordField',
    label: 'Password field',
    x: 368,
    y: 928,
    width: 320,
    height: 120,
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

function maybeResetPersistedSceneForRevision(): void {
  try {
    const cur = localStorage.getItem(ADMIN_CANVAS_SCENE_REVISION_KEY)
    if (cur !== String(ADMIN_CANVAS_SCENE_REVISION)) {
      /** Keep deleted ids: only layout reset on revision bump so removed blocks stay gone. */
      localStorage.removeItem(ADMIN_CANVAS_LAYOUT_KEY)
      localStorage.setItem(
        ADMIN_CANVAS_SCENE_REVISION_KEY,
        String(ADMIN_CANVAS_SCENE_REVISION),
      )
    }
  } catch {
    /* ignore */
  }
}

/**
 * Scene from code minus persisted deletes, with persisted positions/published.
 */
function buildInitialElements(scene: CanvasElement[]): CanvasElement[] {
  maybeResetPersistedSceneForRevision()
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

/** Keep world point under (mx, my) fixed after scale change (origin top-left). */
function zoomTowardScreenPoint(
  stage: StageState,
  mx: number,
  my: number,
  nextScale: number,
): StageState {
  const s0 = stage.scale || 1
  const s1 = clamp(nextScale, STAGE_SCALE_MIN, STAGE_SCALE_MAX)
  if (s0 <= 0) return { ...stage, scale: s1 }
  const ratio = s1 / s0
  return {
    scale: s1,
    tx: mx - (mx - stage.tx) * ratio,
    ty: my - (my - stage.ty) * ratio,
  }
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
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
  const fitScale = Math.min(innerW / cw, innerH / ch)
  const scale = clamp(
    Math.min(fitScale, DEFAULT_CANVAS_FIT_MAX_SCALE),
    STAGE_SCALE_MIN,
    STAGE_SCALE_MAX,
  )
  const tx = (viewportW - cw * scale) / 2 - minX * scale
  const ty = (viewportH - ch * scale) / 2 - minY * scale
  return { tx, ty, scale }
}

export function AdminCanvasStage() {
  const { refreshCatalog, catalogVersion } = useCatalogRefresh()
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
  const [spaceHeld, setSpaceHeld] = useState(false)

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
  const spaceDownRef = useRef(false)
  const latestStageRef = useRef<StageState>(stage)
  latestStageRef.current = stage
  const stageRafRef = useRef<number | null>(null)
  const blockRootsRef = useRef<Record<string, HTMLElement | null>>({})
  const viewportRef = useRef<HTMLDivElement>(null)
  const elementsRef = useRef(elements)
  elementsRef.current = elements

  /** Catalog lists refetch when the default scene’s block set changes (new deploy or scene edit). */
  useEffect(() => {
    const fingerprint = ADMIN_CANVAS_SCENE.map((e) => e.id)
      .sort()
      .join('|')
    try {
      const prev = sessionStorage.getItem(ADMIN_CANVAS_SCENE_IDS_SESSION_KEY)
      if (prev !== fingerprint) {
        sessionStorage.setItem(ADMIN_CANVAS_SCENE_IDS_SESSION_KEY, fingerprint)
        refreshCatalog()
      }
    } catch {
      /* ignore */
    }
  }, [refreshCatalog])

  const cancelStageAnimation = useCallback(() => {
    if (stageRafRef.current != null) {
      cancelAnimationFrame(stageRafRef.current)
      stageRafRef.current = null
    }
  }, [])

  const animateStageTo = useCallback(
    (target: StageState) => {
      cancelStageAnimation()
      const start = { ...latestStageRef.current }
      const t0 = performance.now()
      const tick = (now: number) => {
        const u = Math.min(1, (now - t0) / STAGE_ANIM_MS)
        const e = easeOutCubic(u)
        const next: StageState = {
          tx: start.tx + (target.tx - start.tx) * e,
          ty: start.ty + (target.ty - start.ty) * e,
          scale: start.scale + (target.scale - start.scale) * e,
        }
        latestStageRef.current = next
        setStage(next)
        if (u < 1) {
          stageRafRef.current = requestAnimationFrame(tick)
        } else {
          stageRafRef.current = null
        }
      }
      stageRafRef.current = requestAnimationFrame(tick)
    },
    [cancelStageAnimation],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return
      e.preventDefault()
      spaceDownRef.current = true
      setSpaceHeld(true)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      spaceDownRef.current = false
      setSpaceHeld(false)
    }
    const onBlur = () => {
      spaceDownRef.current = false
      setSpaceHeld(false)
    }
    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('keyup', onKeyUp, { capture: true })
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('keyup', onKeyUp, { capture: true })
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      cancelStageAnimation()
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      let delta = -e.deltaY
      if (e.deltaMode === 1) delta *= 16
      if (e.deltaMode === 2) delta *= rect.height
      const factor = Math.exp(delta * 0.0011)
      setStage((s) => zoomTowardScreenPoint(s, mx, my, s.scale * factor))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [cancelStageAnimation])

  useEffect(() => {
    persistLayoutSnapshot(elements)
  }, [elements])

  /** Source of truth for Published badge: catalog index (survives layout resets / new sessions). */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const index = await fetchCatalogIndex(catalogVersion)
        const publishedIds = new Set(
          index.components
            .filter((c) => c.hasBlueprint)
            .map((c) => c.id),
        )
        if (cancelled) return
        setElements((prev) =>
          prev.map((b) => ({
            ...b,
            published: publishedIds.has(b.componentId),
          })),
        )
      } catch {
        /* helper or static catalog unreachable — keep current flags */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [catalogVersion])

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

  const fitStageToViewport = useCallback(
    (opts?: { animate?: boolean }) => {
      const el = viewportRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.width < 8 || r.height < 8) return
      const target = fitStageToElements(
        elementsRef.current,
        r.width,
        r.height,
        40,
      )
      cancelStageAnimation()
      if (opts?.animate) {
        animateStageTo(target)
      } else {
        latestStageRef.current = target
        setStage(target)
      }
    },
    [animateStageTo, cancelStageAnimation],
  )

  const zoomIn = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.width / 2
    const cy = r.height / 2
    const s = latestStageRef.current
    const target = zoomTowardScreenPoint(
      s,
      cx,
      cy,
      s.scale * STAGE_ZOOM_STEP,
    )
    animateStageTo(target)
  }, [animateStageTo])

  const zoomOut = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.width / 2
    const cy = r.height / 2
    const s = latestStageRef.current
    const target = zoomTowardScreenPoint(
      s,
      cx,
      cy,
      s.scale / STAGE_ZOOM_STEP,
    )
    animateStageTo(target)
  }, [animateStageTo])

  const resetView = useCallback(() => {
    fitStageToViewport({ animate: true })
  }, [fitStageToViewport])

  useLayoutEffect(() => {
    fitStageToViewport({ animate: false })
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver(() => fitStageToViewport({ animate: false }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [fitStageToViewport])

  const onPanPointerDown = (e: React.PointerEvent) => {
    const leftOnEmpty = e.button === 0 && !spaceDownRef.current
    const spaceLeft = e.button === 0 && spaceDownRef.current
    const middle = e.button === 1
    if (!leftOnEmpty && !spaceLeft && !middle) return
    if (middle) e.preventDefault()
    cancelStageAnimation()
    setSelectedBlockId(null)
    const vp = viewportRef.current
    try {
      vp?.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    const o = latestStageRef.current
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originTx: o.tx,
      originTy: o.ty,
    }
  }

  const onPanPointerMove = (e: React.PointerEvent) => {
    const p = panRef.current
    if (!p) return
    const dx = e.clientX - p.startX
    const dy = e.clientY - p.startY
    setStage((s) => {
      const next = {
        ...s,
        tx: p.originTx + dx,
        ty: p.originTy + dy,
      }
      latestStageRef.current = next
      return next
    })
  }

  const endPan = (e: React.PointerEvent) => {
    if (!panRef.current) return
    try {
      viewportRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    panRef.current = null
  }

  const onPointerDownBlock = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (e.button === 1 || (e.button === 0 && spaceDownRef.current)) {
        e.preventDefault()
        e.stopPropagation()
        cancelStageAnimation()
        setSelectedBlockId(null)
        try {
          viewportRef.current?.setPointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
        const o = latestStageRef.current
        panRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          originTx: o.tx,
          originTy: o.ty,
        }
        return
      }
      if (e.button !== 0) return
      const el = elements.find((x) => x.id === id)
      if (!el) return
      cancelStageAnimation()
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
    [cancelStageAnimation, elements],
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
      const removed = elementsRef.current.find((x) => x.id === id)
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

      if (removed?.componentId) {
        void postDeleteComponent(removed.componentId)
          .then(() => {
            refreshCatalog()
          })
          .catch((err) => {
            alert(
              err instanceof Error
                ? err.message
                : 'Could not remove this component from the catalog. Is the publish helper running?',
            )
          })
      }
    },
    [publishBlockId, refreshCatalog],
  )

  const transformStyle = {
    transform: `translate(${stage.tx}px, ${stage.ty}px) scale(${stage.scale})`,
    transformOrigin: '0 0',
    willChange: 'transform',
  } as const

  return (
    <div className="flex h-full min-h-0 flex-col bg-brandcolor-fill">
      <div
        ref={viewportRef}
        className={`relative min-h-0 flex-1 overflow-hidden ${
          spaceHeld ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{ touchAction: 'none' }}
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
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.5]"
          style={CANVAS_GRID_BG_STYLE}
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
            className="absolute left-0 top-0 z-[1] cursor-grab bg-transparent active:cursor-grabbing"
            style={{ width: CANVAS_WORLD_W, height: CANVAS_WORLD_H }}
            data-pan-layer
            onPointerDown={onPanPointerDown}
          />
          {elements.map((item) => {
            const isSelected = selectedBlockId === item.id
            return (
              <div
                key={item.id}
                role="group"
                aria-label={`Canvas block: ${item.label}`}
                aria-selected={isSelected}
                className={`group/canvas-block absolute cursor-grab select-none rounded-lg bg-transparent transition-shadow duration-150 active:cursor-grabbing ${
                  isSelected
                    ? 'z-[50] ring-2 ring-brandcolor-banner-info-bg ring-offset-2 ring-offset-brandcolor-fill'
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

/** Single-line canvas inputs: mild border, stroke strong on focus/active, fill on hover. */
const CANVAS_AUTH_INPUT_CLASS =
  'mt-1 block w-full rounded-md border border-brandcolor-strokemild bg-brandcolor-white px-3 py-2 text-sm text-brandcolor-textstrong placeholder:text-brandcolor-textweak hover:bg-brandcolor-fill focus:border-brandcolor-strokestrong focus:outline-none focus:ring-0 active:border-brandcolor-strokestrong'

const AdminCanvasNameField = forwardRef(function AdminCanvasNameField(
  { componentId }: { componentId: string },
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [name, setName] = useState('')

  return (
    <div
      ref={ref}
      data-component-name={componentId}
      className="flex h-full min-h-0 flex-col justify-center p-3"
    >
      <label className="block min-w-0 text-sm font-medium text-brandcolor-textstrong">
        Name
        <input
          type="text"
          name={`${componentId}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          autoComplete="name"
          className={CANVAS_AUTH_INPUT_CLASS}
        />
      </label>
    </div>
  )
})

const AdminCanvasPasswordField = forwardRef(function AdminCanvasPasswordField(
  { componentId }: { componentId: string },
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [passwordDigits, setPasswordDigits] = useState('')
  const hintId = `${componentId}-pw-hint`

  return (
    <div
      ref={ref}
      data-component-name={componentId}
      className="flex h-full min-h-0 flex-col justify-center p-3"
    >
      <label className="block min-w-0 text-sm font-medium text-brandcolor-textstrong">
        Password
        <input
          type="password"
          name={`${componentId}-password`}
          value={passwordDigits}
          onChange={(e) =>
            setPasswordDigits(e.target.value.replace(/\D/g, ''))
          }
          onPointerDown={(e) => e.stopPropagation()}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="new-password"
          placeholder="Digits only"
          className={CANVAS_AUTH_INPUT_CLASS}
          aria-describedby={hintId}
        />
      </label>
      <p id={hintId} className="mt-1 text-[11px] text-brandcolor-textweak">
        Numbers only.
      </p>
    </div>
  )
})

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
        <button type="button" className={THEME_GUIDE_BUTTON_PRIMARY}>
          {element.label}
        </button>
      </div>
    )
  }

  if (element.type === 'case') {
    return (
      <AdminCanvasCaseCard
        ref={ref}
        componentId={element.componentId}
        caseName={element.label}
        subHeading={
          element.subtitle ?? 'Subheading summarizes the case focus.'
        }
        description={
          element.paragraph ??
          'Description uses theme-guide body copy for the case study summary.'
        }
      />
    )
  }

  if (element.type === 'profile') {
    return (
      <AdminCanvasProfileCard
        ref={ref}
        componentId={element.componentId}
        personName={
          element.personName ??
          element.label ??
          'Name'
        }
        title={
          element.subtitle ??
          'Title or role appears here in text-weak.'
        }
        paragraph={
          element.paragraph ??
          'First line of supporting copy uses theme-guide body scale.'
        }
        paragraph2={
          element.paragraph2 ??
          'Second line continues the profile summary.'
        }
      />
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

  if (element.type === 'promo') {
    return (
      <AdminCanvasPromoCard
        ref={ref}
        componentId={element.componentId}
        promoHeadline={
          element.promoHeadline ??
          element.label ??
          'Promo headline'
        }
        promoSubtitle={
          element.promoSubtitle ??
          'Supporting subtitle under the promo headline.'
        }
        secondaryHeading={
          element.secondaryHeading ?? 'Second heading'
        }
        secondarySubtitle={
          element.secondarySubtitle ??
          'Subtitle under the second heading.'
        }
        paragraph={
          element.paragraph ??
          'First body paragraph.'
        }
        paragraph2={element.paragraph2}
      />
    )
  }

  if (element.type === 'plain') {
    return (
      <AdminCanvasPlainCard
        ref={ref}
        componentId={element.componentId}
        paragraph={
          element.paragraph ??
          'Body copy on a plain card surface.'
        }
        paragraph2={element.paragraph2}
      />
    )
  }

  if (element.type === 'authNameField') {
    return (
      <AdminCanvasNameField ref={ref} componentId={element.componentId} />
    )
  }

  if (element.type === 'authPasswordField') {
    return (
      <AdminCanvasPasswordField ref={ref} componentId={element.componentId} />
    )
  }

  if (element.type === 'chart') {
    return (
      <div
        ref={ref}
        data-component-name={element.componentId}
        className={`flex h-full flex-col gap-2 ${CANVAS_BLOCK_INSET} ${THEME_CANVAS_BLOCK_SURFACE}`}
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

const AdminCanvasCaseCard = forwardRef(function AdminCanvasCaseCard(
  {
    componentId,
    caseName,
    subHeading,
    description,
  }: {
    componentId: string
    caseName: string
    subHeading: string
    description: string
  },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      data-component-name={componentId}
      className={`flex h-full min-h-0 flex-col ${CANVAS_BLOCK_INSET} ${THEME_CANVAS_BLOCK_SURFACE}`}
    >
      <header className="flex min-w-0 items-start justify-between gap-2">
        <h2 className={`min-w-0 flex-1 truncate ${THEME_GUIDE_HEADING_H2}`}>
          {caseName}
        </h2>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            title="Share"
            aria-label="Share"
            className={PROFILE_ICON_BTN}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <RiShareLine className="size-[18px]" aria-hidden />
          </button>
          <button
            type="button"
            title="Tag"
            aria-label="Tag"
            className={PROFILE_ICON_BTN}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <RiPriceTag3Line className="size-[18px]" aria-hidden />
          </button>
        </div>
      </header>
      <p className="mt-2 text-sm font-semibold text-brandcolor-textstrong">
        {subHeading}
      </p>
      <p className={`mt-3 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{description}</p>
    </div>
  )
})

const AdminCanvasProfileCard = forwardRef(function AdminCanvasProfileCard(
  {
    componentId,
    personName,
    title,
    paragraph,
    paragraph2,
  }: {
    componentId: string
    personName: string
    title: string
    paragraph: string
    paragraph2: string
  },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      data-component-name={componentId}
      className={`flex h-full min-h-0 flex-col ${CANVAS_BLOCK_INSET} ${THEME_CANVAS_BLOCK_SURFACE}`}
    >
      <header className="flex min-w-0 items-start justify-between gap-2">
        <h2 className={`min-w-0 flex-1 truncate ${THEME_GUIDE_HEADING_H2}`}>
          {personName}
        </h2>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            title="More options"
            aria-label="More options"
            className={PROFILE_ICON_BTN}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <RiMore2Line className="size-[18px]" aria-hidden />
          </button>
          <button
            type="button"
            title="Share"
            aria-label="Share"
            className={PROFILE_ICON_BTN}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <RiShareLine className="size-[18px]" aria-hidden />
          </button>
        </div>
      </header>
      <p className="mt-1 text-sm text-brandcolor-textweak">{title}</p>
      <p className={`mt-3 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{paragraph}</p>
      <p className={`mt-2 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{paragraph2}</p>
    </div>
  )
})

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
      className={`flex h-full min-h-0 flex-col overflow-auto ${CANVAS_BLOCK_INSET} ${THEME_CANVAS_BLOCK_SURFACE}`}
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

const AdminCanvasPromoCard = forwardRef(function AdminCanvasPromoCard(
  {
    componentId,
    promoHeadline,
    promoSubtitle,
    secondaryHeading,
    secondarySubtitle,
    paragraph,
    paragraph2,
  }: {
    componentId: string
    promoHeadline: string
    promoSubtitle: string
    secondaryHeading: string
    secondarySubtitle: string
    paragraph: string
    paragraph2?: string
  },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      data-component-name={componentId}
      className={`flex h-full min-h-0 flex-col overflow-auto ${CANVAS_BLOCK_INSET} ${THEME_CANVAS_BLOCK_SURFACE}`}
    >
      <h1 className={THEME_GUIDE_HEADING_H1}>{promoHeadline}</h1>
      <p className={`mt-2 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{promoSubtitle}</p>
      <h2 className={`mt-6 ${THEME_GUIDE_HEADING_H2}`}>{secondaryHeading}</h2>
      <p className={`mt-2 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>
        {secondarySubtitle}
      </p>
      <p className={`mt-4 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{paragraph}</p>
      {paragraph2 ? (
        <p className={`mt-2 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{paragraph2}</p>
      ) : null}
    </div>
  )
})

const AdminCanvasPlainCard = forwardRef(function AdminCanvasPlainCard(
  {
    componentId,
    paragraph,
    paragraph2,
  }: {
    componentId: string
    paragraph: string
    paragraph2?: string
  },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      data-component-name={componentId}
      className={`flex h-full min-h-0 flex-col overflow-auto ${CANVAS_BLOCK_INSET} ${THEME_CANVAS_BLOCK_SURFACE}`}
    >
      <p className={THEME_GUIDE_TEXT_WEAK_BODY}>{paragraph}</p>
      {paragraph2 ? (
        <p className={`mt-2 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{paragraph2}</p>
      ) : null}
    </div>
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
      className={`flex h-full flex-col ${CANVAS_BLOCK_INSET} ${THEME_CANVAS_BLOCK_SURFACE}`}
    >
      <h3 className={THEME_GUIDE_HEADING_H3}>{title}</h3>
      <p className={`mt-2 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{subtitle}</p>
      <p className={`mt-2 ${THEME_GUIDE_TEXT_WEAK_BODY}`}>{paragraph}</p>
    </div>
  )
})
