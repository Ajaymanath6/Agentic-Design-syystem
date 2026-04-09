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

import { createHtmlSnippetCanvasNode } from '../lib/append-html-snippet-canvas-node'
import type { CanvasNode } from '../lib/canvas-node-publish'
import { sanitizeCanvasHtmlFragment } from '../lib/sanitize-canvas-html'
import { summarizeAppendedCanvasNodes } from '../lib/summarize-canvas-appended-nodes'
import { mapCanvasPlanToNewNodes } from '../lib/map-canvas-plan-to-nodes'
import { callComponentsCanvasGenerateHtml } from '../services/components-canvas-html'
import { callComponentsCanvasPlan } from '../services/components-canvas-llm'
import type { CanvasPlanChatMessage } from '../types/components-canvas-plan-request'
import {
  MAX_CANVAS_CHAT_MESSAGE_CHARS,
  MAX_CANVAS_CHAT_MESSAGES,
} from '../types/components-canvas-plan-request'

const EXTENDED_DESIGN_CONTEXT_STORAGE_KEY =
  'components-canvas-extended-design-context'

const COMPONENTS_CANVAS_AI_MODE_KEY = 'components-canvas-ai-mode'

export type ComponentsCanvasAiMode = 'plan' | 'htmlCreator'

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
  /** `plan` = JSON node plan (`/canvas/plan`). `htmlCreator` = HTML fragment (`/canvas/generate-html`). */
  componentsCanvasAiMode: ComponentsCanvasAiMode
  setComponentsCanvasAiMode: (v: ComponentsCanvasAiMode) => void
  /** Calls Vertex `/canvas/plan` or `/canvas/generate-html` per mode. Returns nodes to append. */
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
  const [componentsCanvasAiMode, setComponentsCanvasAiModeState] =
    useState<ComponentsCanvasAiMode>('plan')
  const planGenRef = useRef(0)

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(EXTENDED_DESIGN_CONTEXT_STORAGE_KEY)
      if (v === '1' || v === 'true') {
        setExtendedDesignContextState(true)
      }
      const m = sessionStorage.getItem(COMPONENTS_CANVAS_AI_MODE_KEY)
      if (m === 'htmlCreator' || m === 'plan') {
        setComponentsCanvasAiModeState(m)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const setComponentsCanvasAiMode = useCallback((v: ComponentsCanvasAiMode) => {
    setComponentsCanvasAiModeState(v)
    try {
      sessionStorage.setItem(COMPONENTS_CANVAS_AI_MODE_KEY, v)
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
        let appended: CanvasNode[]
        if (componentsCanvasAiMode === 'htmlCreator') {
          const res = await callComponentsCanvasGenerateHtml({
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
          const safe = sanitizeCanvasHtmlFragment(res.html)
          if (!safe.trim()) {
            throw new Error('Model HTML was empty after sanitization')
          }
          appended = [
            createHtmlSnippetCanvasNode(existingNodes, safe, res.title),
          ]
        } else {
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
          appended = mapCanvasPlanToNewNodes(plan, existingNodes)
        }
        if (planGenRef.current !== gen) {
          return { appended: [], error: null }
        }
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
      componentsCanvasAiMode,
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
      componentsCanvasAiMode,
      setComponentsCanvasAiMode,
      submitComponentsPrompt,
    }),
    [
      componentsPromptDraft,
      canvasPlanChatMessages,
      extendedDesignContext,
      componentsPlanBusy,
      componentsPlanError,
      componentsCanvasAiMode,
      setComponentsCanvasAiMode,
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
