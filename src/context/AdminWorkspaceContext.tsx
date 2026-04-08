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
import { useLocation } from 'react-router-dom'
import { callLayoutPlan } from '../services/layout-llm'
import type { LayoutPlanV1 } from '../types/layout-plan'

export type AdminWorkspaceMode = 'canvas' | 'layout'

type AdminWorkspaceContextValue = {
  mode: AdminWorkspaceMode
  setMode: (mode: AdminWorkspaceMode) => void
  /** Layout workspace: shared between sidebar prompt and main preview */
  layoutPromptDraft: string
  setLayoutPromptDraft: (v: string) => void
  layoutPromptEntries: string[]
  /** Validated structured plan from POST /layout/plan (last successful fetch). */
  layoutPlan: LayoutPlanV1 | null
  layoutPlanBusy: boolean
  layoutPlanError: string | null
  /**
   * Append prompt, clear draft, show heuristic preview immediately, then fetch structured plan.
   */
  submitLayoutPrompt: (catalogAllowlist?: string[]) => void
}

const AdminWorkspaceContext = createContext<AdminWorkspaceContextValue | null>(
  null,
)

const ADMIN_WORKSPACE_MODE_STORAGE_KEY = 'admin-workspace-mode'

function readStoredAdminMode(): AdminWorkspaceMode {
  if (typeof window === 'undefined') return 'canvas'
  try {
    const v = window.sessionStorage.getItem(ADMIN_WORKSPACE_MODE_STORAGE_KEY)
    if (v === 'layout' || v === 'canvas') return v
  } catch {
    /* private mode / quota */
  }
  return 'canvas'
}

function writeStoredAdminMode(mode: AdminWorkspaceMode): void {
  try {
    window.sessionStorage.setItem(ADMIN_WORKSPACE_MODE_STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}

export function AdminWorkspaceProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [mode, setModeState] = useState<AdminWorkspaceMode>(readStoredAdminMode)
  const [layoutPromptDraft, setLayoutPromptDraft] = useState('')
  const [layoutPromptEntries, setLayoutPromptEntries] = useState<string[]>([])
  const [layoutPlan, setLayoutPlan] = useState<LayoutPlanV1 | null>(null)
  const [layoutPlanBusy, setLayoutPlanBusy] = useState(false)
  const [layoutPlanError, setLayoutPlanError] = useState<string | null>(null)
  const layoutPlanGenRef = useRef(0)

  const setMode = useCallback((next: AdminWorkspaceMode) => {
    setModeState(next)
    writeStoredAdminMode(next)
  }, [])

  const submitLayoutPrompt = useCallback(
    (catalogAllowlist?: string[]) => {
      const t = layoutPromptDraft.trim()
      if (!t) return
      const gen = ++layoutPlanGenRef.current
      setLayoutPromptEntries((prev) => [...prev, t])
      setLayoutPromptDraft('')
      setLayoutPlan(null)
      setLayoutPlanError(null)
      setLayoutPlanBusy(true)
      const list = catalogAllowlist ?? []
      void callLayoutPlan(t, list)
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
    },
    [layoutPromptDraft],
  )

  useEffect(() => {
    if (pathname === '/admin') {
      setModeState(readStoredAdminMode())
    } else {
      setModeState('canvas')
    }
  }, [pathname])

  const value = useMemo(
    () => ({
      mode,
      setMode,
      layoutPromptDraft,
      setLayoutPromptDraft,
      layoutPromptEntries,
      layoutPlan,
      layoutPlanBusy,
      layoutPlanError,
      submitLayoutPrompt,
    }),
    [
      mode,
      setMode,
      layoutPromptDraft,
      layoutPromptEntries,
      layoutPlan,
      layoutPlanBusy,
      layoutPlanError,
      submitLayoutPrompt,
    ],
  )

  return (
    <AdminWorkspaceContext.Provider value={value}>
      {children}
    </AdminWorkspaceContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useAdminWorkspace() {
  const ctx = useContext(AdminWorkspaceContext)
  if (!ctx) {
    throw new Error(
      'useAdminWorkspace must be used within AdminWorkspaceProvider',
    )
  }
  return ctx
}
