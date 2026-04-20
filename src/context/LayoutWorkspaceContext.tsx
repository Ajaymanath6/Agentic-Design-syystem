import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useCatalogCards } from '../hooks/useCatalogCards'
import { catalogCardDisplayName } from '../lib/catalog-display-name'
import { isCatalogLayoutEntry } from '../lib/catalog-layout-entry'
import { buildCatalogAllowlist } from '../lib/layout-plan-catalog'
import { sanitizeCanvasHtmlFragment } from '../lib/sanitize-canvas-html'
import { callLayoutGenerateHtml, callLayoutPlan } from '../services/layout-llm'
import {
  MAX_LAYOUT_CATALOG_REFERENCE_HTML_SNIPPET_CHARS,
  type LayoutCatalogReferenceBlock,
} from '../types/layout-html-request'
import type { CatalogCardModel } from '../types/catalog'
import type { LayoutPlanV1 } from '../types/layout-plan'

const REF_ONLY_FALLBACK =
  'Layout using referenced catalog components.'

export type LayoutWorkspaceMode = 'plan' | 'html'

export type LayoutWorkspaceContextValue = {
  layoutPromptDraft: string
  setLayoutPromptDraft: (v: string) => void
  /** Selected published component catalog entry ids (order preserved). */
  layoutCatalogRefIds: string[]
  setLayoutCatalogRefIds: (ids: string[] | ((prev: string[]) => string[])) => void
  layoutPromptEntries: string[]
  layoutWorkspaceMode: LayoutWorkspaceMode
  setLayoutWorkspaceMode: (m: LayoutWorkspaceMode) => void
  /** Structured plan from /layout/plan */
  layoutPlan: LayoutPlanV1 | null
  layoutPlanBusy: boolean
  layoutPlanError: string | null
  /** Generative HTML mode */
  layoutGeneratedHtml: string | null
  layoutGeneratedTitle: string | null
  layoutHtmlBusy: boolean
  layoutHtmlError: string | null
  extendedLayoutDesignContext: boolean
  setExtendedLayoutDesignContext: (v: boolean) => void
  layoutHtmlSpacingEnforcement: boolean
  setLayoutHtmlSpacingEnforcement: (v: boolean) => void
  submitLayoutPrompt: () => void
  /** Published components only (excludes layout entries) for @-mentions. */
  layoutMentionCards: CatalogCardModel[]
}

const LayoutWorkspaceContext = createContext<LayoutWorkspaceContextValue | null>(
  null,
)

function buildCatalogReferenceBlocks(
  ids: string[],
  cards: CatalogCardModel[],
): LayoutCatalogReferenceBlock[] {
  const out: LayoutCatalogReferenceBlock[] = []
  for (const id of ids) {
    const card = cards.find((c) => c.entry.id === id)
    if (!card) continue
    const raw = card.entry.sourceHtml?.trim() ?? ''
    const htmlSnippet = raw.slice(0, MAX_LAYOUT_CATALOG_REFERENCE_HTML_SNIPPET_CHARS)
    out.push({
      id: card.entry.id,
      label: catalogCardDisplayName(card),
      htmlSnippet,
    })
  }
  return out
}

export function LayoutWorkspaceProvider({ children }: { children: ReactNode }) {
  const [layoutPromptDraft, setLayoutPromptDraft] = useState('')
  const [layoutCatalogRefIds, setLayoutCatalogRefIds] = useState<string[]>([])
  const [layoutPromptEntries, setLayoutPromptEntries] = useState<string[]>([])
  const [layoutWorkspaceMode, setLayoutWorkspaceModeState] =
    useState<LayoutWorkspaceMode>('plan')
  const [layoutPlan, setLayoutPlan] = useState<LayoutPlanV1 | null>(null)
  const [layoutPlanBusy, setLayoutPlanBusy] = useState(false)
  const [layoutPlanError, setLayoutPlanError] = useState<string | null>(null)
  const [layoutGeneratedHtml, setLayoutGeneratedHtml] = useState<string | null>(
    null,
  )
  const [layoutGeneratedTitle, setLayoutGeneratedTitle] = useState<string | null>(
    null,
  )
  const [layoutHtmlBusy, setLayoutHtmlBusy] = useState(false)
  const [layoutHtmlError, setLayoutHtmlError] = useState<string | null>(null)
  const [extendedLayoutDesignContext, setExtendedLayoutDesignContext] =
    useState(false)
  const [layoutHtmlSpacingEnforcement, setLayoutHtmlSpacingEnforcement] =
    useState(false)
  const layoutPlanGenRef = useRef(0)
  const layoutHtmlGenRef = useRef(0)
  const prevLayoutWorkspaceMode = useRef<LayoutWorkspaceMode>('plan')
  const { cards } = useCatalogCards()
  const catalogAllowlist = useMemo(
    () => buildCatalogAllowlist(cards),
    [cards],
  )

  const layoutMentionCards = useMemo(
    () => cards.filter((c) => !isCatalogLayoutEntry(c.entry)),
    [cards],
  )

  const setLayoutWorkspaceMode = useCallback((m: LayoutWorkspaceMode) => {
    setLayoutWorkspaceModeState(m)
  }, [])

  useEffect(() => {
    const prev = prevLayoutWorkspaceMode.current
    if (prev === layoutWorkspaceMode) return
    prevLayoutWorkspaceMode.current = layoutWorkspaceMode
    if (layoutWorkspaceMode === 'html') {
      setLayoutPlan(null)
      setLayoutPlanError(null)
    } else {
      setLayoutGeneratedHtml(null)
      setLayoutGeneratedTitle(null)
      setLayoutHtmlError(null)
    }
  }, [layoutWorkspaceMode])

  const submitLayoutPrompt = useCallback(() => {
    const t = layoutPromptDraft.trim()
    if (!t && layoutCatalogRefIds.length === 0) return
    const refLabels = layoutCatalogRefIds
      .map((id) => cards.find((c) => c.entry.id === id))
      .filter((c): c is CatalogCardModel => c != null)
      .map((c) => catalogCardDisplayName(c))
    const base =
      t || (refLabels.length > 0 ? REF_ONLY_FALLBACK : '')
    if (!base.trim() && refLabels.length === 0) return
    const refLine =
      refLabels.length > 0
        ? `\n\nReferenced catalog components (in order): ${refLabels.join(', ')}`
        : ''
    const promptForApi = (base + refLine).trim()
    const refBlocks = buildCatalogReferenceBlocks(layoutCatalogRefIds, cards)

    if (layoutWorkspaceMode === 'html') {
      const gen = ++layoutHtmlGenRef.current
      setLayoutPromptEntries((prev) => [...prev, promptForApi])
      setLayoutPromptDraft('')
      setLayoutCatalogRefIds([])
      setLayoutPlan(null)
      setLayoutPlanError(null)
      setLayoutGeneratedHtml(null)
      setLayoutGeneratedTitle(null)
      setLayoutHtmlError(null)
      setLayoutHtmlBusy(true)
      void callLayoutGenerateHtml({
        prompt: promptForApi,
        catalogAllowlist,
        catalogReferenceBlocks:
          refBlocks.length > 0 ? refBlocks : undefined,
        extended_design_context: extendedLayoutDesignContext,
        spacing_enforcement: layoutHtmlSpacingEnforcement,
      })
        .then((res) => {
          if (layoutHtmlGenRef.current !== gen) return
          const safe = sanitizeCanvasHtmlFragment(res.html)
          setLayoutGeneratedHtml(safe)
          setLayoutGeneratedTitle(res.title.trim())
        })
        .catch((e: unknown) => {
          if (layoutHtmlGenRef.current !== gen) return
          const msg = e instanceof Error ? e.message : String(e)
          setLayoutHtmlError(msg)
          setLayoutGeneratedHtml(null)
          setLayoutGeneratedTitle(null)
        })
        .finally(() => {
          if (layoutHtmlGenRef.current === gen) {
            setLayoutHtmlBusy(false)
          }
        })
      return
    }

    const gen = ++layoutPlanGenRef.current
    setLayoutPromptEntries((prev) => [...prev, promptForApi])
    setLayoutPromptDraft('')
    setLayoutCatalogRefIds([])
    setLayoutGeneratedHtml(null)
    setLayoutGeneratedTitle(null)
    setLayoutHtmlError(null)
    setLayoutPlan(null)
    setLayoutPlanError(null)
    setLayoutPlanBusy(true)
    void callLayoutPlan(promptForApi, catalogAllowlist)
      .then((plan) => {
        if (layoutPlanGenRef.current !== gen) return
        setLayoutPlan(plan)
      })
      .catch((e: unknown) => {
        if (layoutPlanGenRef.current !== gen) return
        const msg = e instanceof Error ? e.message : String(e)
        setLayoutPlanError(msg)
        setLayoutPlan(null)
      })
      .finally(() => {
        if (layoutPlanGenRef.current === gen) {
          setLayoutPlanBusy(false)
        }
      })
  }, [
    layoutPromptDraft,
    layoutCatalogRefIds,
    catalogAllowlist,
    cards,
    layoutWorkspaceMode,
    extendedLayoutDesignContext,
    layoutHtmlSpacingEnforcement,
  ])

  const value = useMemo<LayoutWorkspaceContextValue>(
    () => ({
      layoutPromptDraft,
      setLayoutPromptDraft,
      layoutCatalogRefIds,
      setLayoutCatalogRefIds,
      layoutPromptEntries,
      layoutWorkspaceMode,
      setLayoutWorkspaceMode,
      layoutPlan,
      layoutPlanBusy,
      layoutPlanError,
      layoutGeneratedHtml,
      layoutGeneratedTitle,
      layoutHtmlBusy,
      layoutHtmlError,
      extendedLayoutDesignContext,
      setExtendedLayoutDesignContext,
      layoutHtmlSpacingEnforcement,
      setLayoutHtmlSpacingEnforcement,
      submitLayoutPrompt,
      layoutMentionCards,
    }),
    [
      layoutPromptDraft,
      layoutCatalogRefIds,
      layoutPromptEntries,
      layoutWorkspaceMode,
      setLayoutWorkspaceMode,
      layoutPlan,
      layoutPlanBusy,
      layoutPlanError,
      layoutGeneratedHtml,
      layoutGeneratedTitle,
      layoutHtmlBusy,
      layoutHtmlError,
      extendedLayoutDesignContext,
      layoutHtmlSpacingEnforcement,
      submitLayoutPrompt,
      layoutMentionCards,
    ],
  )

  return (
    <LayoutWorkspaceContext.Provider value={value}>
      {children}
    </LayoutWorkspaceContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useLayoutWorkspace(): LayoutWorkspaceContextValue {
  const ctx = useContext(LayoutWorkspaceContext)
  if (!ctx) {
    throw new Error(
      'useLayoutWorkspace must be used within LayoutWorkspaceProvider',
    )
  }
  return ctx
}
