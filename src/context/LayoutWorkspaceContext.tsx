import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useCatalogCards } from '../hooks/useCatalogCards'
import { buildCatalogAllowlist } from '../lib/layout-plan-catalog'
import { callLayoutPlan } from '../services/layout-llm'
import type { LayoutPlanV1 } from '../types/layout-plan'

export type LayoutWorkspaceContextValue = {
  layoutPromptDraft: string
  setLayoutPromptDraft: (v: string) => void
  layoutPromptEntries: string[]
  layoutPlan: LayoutPlanV1 | null
  layoutPlanBusy: boolean
  layoutPlanError: string | null
  submitLayoutPrompt: () => void
}

const LayoutWorkspaceContext = createContext<LayoutWorkspaceContextValue | null>(
  null,
)

export function LayoutWorkspaceProvider({ children }: { children: ReactNode }) {
  const [layoutPromptDraft, setLayoutPromptDraft] = useState('')
  const [layoutPromptEntries, setLayoutPromptEntries] = useState<string[]>([])
  const [layoutPlan, setLayoutPlan] = useState<LayoutPlanV1 | null>(null)
  const [layoutPlanBusy, setLayoutPlanBusy] = useState(false)
  const [layoutPlanError, setLayoutPlanError] = useState<string | null>(null)
  const layoutPlanGenRef = useRef(0)
  const { cards } = useCatalogCards()
  const catalogAllowlist = useMemo(
    () => buildCatalogAllowlist(cards),
    [cards],
  )

  const submitLayoutPrompt = useCallback(() => {
    const t = layoutPromptDraft.trim()
    if (!t) return
    const gen = ++layoutPlanGenRef.current
    setLayoutPromptEntries((prev) => [...prev, t])
    setLayoutPromptDraft('')
    setLayoutPlan(null)
    setLayoutPlanError(null)
    setLayoutPlanBusy(true)
    void callLayoutPlan(t, catalogAllowlist)
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
  }, [layoutPromptDraft, catalogAllowlist])

  const value = useMemo<LayoutWorkspaceContextValue>(
    () => ({
      layoutPromptDraft,
      setLayoutPromptDraft,
      layoutPromptEntries,
      layoutPlan,
      layoutPlanBusy,
      layoutPlanError,
      submitLayoutPrompt,
    }),
    [
      layoutPromptDraft,
      layoutPromptEntries,
      layoutPlan,
      layoutPlanBusy,
      layoutPlanError,
      submitLayoutPrompt,
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
