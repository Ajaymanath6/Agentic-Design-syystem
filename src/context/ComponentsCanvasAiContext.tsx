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

import type { CanvasNode } from '../lib/canvas-node-publish'
import { summarizeAppendedCanvasNodes } from '../lib/summarize-canvas-appended-nodes'
import { mapCanvasPlanToNewNodes } from '../lib/map-canvas-plan-to-nodes'
import { callComponentsCanvasPlan } from '../services/components-canvas-llm'
import type { CanvasPlanChatMessage } from '../types/components-canvas-plan-request'
import {
  MAX_CANVAS_CHAT_MESSAGE_CHARS,
  MAX_CANVAS_CHAT_MESSAGES,
} from '../types/components-canvas-plan-request'

const EXTENDED_DESIGN_CONTEXT_STORAGE_KEY =
  'components-canvas-extended-design-context'

function clampChatMessageContent(content: string): string {
  if (content.length <= MAX_CANVAS_CHAT_MESSAGE_CHARS) return content
  return `${content.slice(0, MAX_CANVAS_CHAT_MESSAGE_CHARS - 20)}… (truncated)`
}

export type ComponentsCanvasAiContextValue = {
  componentsPromptDraft: string
  setComponentsPromptDraft: (v: string) => void
  /** Prior turns only; current prompt is not included until after submit. */
  canvasPlanChatMessages: CanvasPlanChatMessage[]
  extendedDesignContext: boolean
  setExtendedDesignContext: (v: boolean) => void
  componentsPlanBusy: boolean
  componentsPlanError: string | null
  /** Calls Vertex `/canvas/plan`. Returns nodes to append; `error` set when the request fails. */
  submitComponentsPrompt: (
    existingNodes: CanvasNode[],
  ) => Promise<{ appended: CanvasNode[]; error: string | null }>
}

const ComponentsCanvasAiContext =
  createContext<ComponentsCanvasAiContextValue | null>(null)

export function ComponentsCanvasAiProvider({ children }: { children: ReactNode }) {
  const [componentsPromptDraft, setComponentsPromptDraft] = useState('')
  const [canvasPlanChatMessages, setCanvasPlanChatMessages] = useState<
    CanvasPlanChatMessage[]
  >([])
  const [extendedDesignContext, setExtendedDesignContextState] = useState(false)
  const [componentsPlanBusy, setComponentsPlanBusy] = useState(false)
  const [componentsPlanError, setComponentsPlanError] = useState<string | null>(
    null,
  )
  const planGenRef = useRef(0)

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(EXTENDED_DESIGN_CONTEXT_STORAGE_KEY)
      if (v === '1' || v === 'true') {
        setExtendedDesignContextState(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const setExtendedDesignContext = useCallback((v: boolean) => {
    setExtendedDesignContextState(v)
    try {
      sessionStorage.setItem(EXTENDED_DESIGN_CONTEXT_STORAGE_KEY, v ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [])

  const submitComponentsPrompt = useCallback(
    async (
      existingNodes: CanvasNode[],
    ): Promise<{ appended: CanvasNode[]; error: string | null }> => {
      const t = componentsPromptDraft.trim()
      if (!t) return { appended: [], error: null }
      const gen = ++planGenRef.current
      const priorMessages = canvasPlanChatMessages
      const promptForApi = t.slice(0, 32000)
      setComponentsPromptDraft('')
      setComponentsPlanError(null)
      setComponentsPlanBusy(true)
      try {
        const plan = await callComponentsCanvasPlan({
          prompt: promptForApi,
          messages:
            priorMessages.length > 0
              ? priorMessages.map((m) => ({
                  role: m.role,
                  content: clampChatMessageContent(m.content),
                }))
              : undefined,
          extended_design_context: extendedDesignContext,
        })
        if (planGenRef.current !== gen) {
          return { appended: [], error: null }
        }
        const appended = mapCanvasPlanToNewNodes(plan, existingNodes)
        const assistantContent = summarizeAppendedCanvasNodes(appended)
        setCanvasPlanChatMessages((prev) => {
          const next: CanvasPlanChatMessage[] = [
            ...prev,
            { role: 'user', content: promptForApi },
            { role: 'assistant', content: assistantContent },
          ]
          return next.length > MAX_CANVAS_CHAT_MESSAGES
            ? next.slice(-MAX_CANVAS_CHAT_MESSAGES)
            : next
        })
        return { appended, error: null }
      } catch (e: unknown) {
        if (planGenRef.current !== gen) {
          return { appended: [], error: null }
        }
        const msg = e instanceof Error ? e.message : String(e)
        setComponentsPlanError(msg)
        setCanvasPlanChatMessages((prev) => {
          const next: CanvasPlanChatMessage[] = [
            ...prev,
            { role: 'user', content: promptForApi },
            {
              role: 'assistant',
              content: clampChatMessageContent(`Error: ${msg}`),
            },
          ]
          return next.length > MAX_CANVAS_CHAT_MESSAGES
            ? next.slice(-MAX_CANVAS_CHAT_MESSAGES)
            : next
        })
        return { appended: [], error: msg }
      } finally {
        if (planGenRef.current === gen) {
          setComponentsPlanBusy(false)
        }
      }
    },
    [
      canvasPlanChatMessages,
      componentsPromptDraft,
      extendedDesignContext,
    ],
  )

  const value = useMemo<ComponentsCanvasAiContextValue>(
    () => ({
      componentsPromptDraft,
      setComponentsPromptDraft,
      canvasPlanChatMessages,
      extendedDesignContext,
      setExtendedDesignContext,
      componentsPlanBusy,
      componentsPlanError,
      submitComponentsPrompt,
    }),
    [
      componentsPromptDraft,
      canvasPlanChatMessages,
      extendedDesignContext,
      componentsPlanBusy,
      componentsPlanError,
      submitComponentsPrompt,
      setExtendedDesignContext,
    ],
  )

  return (
    <ComponentsCanvasAiContext.Provider value={value}>
      {children}
    </ComponentsCanvasAiContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useComponentsCanvasAi(): ComponentsCanvasAiContextValue {
  const ctx = useContext(ComponentsCanvasAiContext)
  if (!ctx) {
    throw new Error(
      'useComponentsCanvasAi must be used within ComponentsCanvasAiProvider',
    )
  }
  return ctx
}
