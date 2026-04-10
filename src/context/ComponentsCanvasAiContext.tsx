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
import {
  buildCanvasReferencesForRequest,
  canvasMentionDisplayName,
} from '../lib/canvas-node-llm-context'
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

/** Backend requires non-empty prompt; used when the user only picked canvas refs (no typed text). */
const REF_ONLY_PROMPT_FALLBACK =
  'Use the referenced canvas blocks as context.'

export type ComponentsCanvasAiMode = 'plan' | 'htmlCreator'

function clampChatMessageContent(content: string): string {
  if (content.length <= MAX_CANVAS_CHAT_MESSAGE_CHARS) return content
  return `${content.slice(0, MAX_CANVAS_CHAT_MESSAGE_CHARS - 20)}… (truncated)`
}

export type ComponentsCanvasAiContextValue = {
  componentsPromptDraft: string
  setComponentsPromptDraft: (v: string) => void
  /**
   * Picked canvas blocks (badges); not duplicated as `@canvas:` text in the draft.
   * Order is stable: first pick → first in array → first in API `canvas_references` merge.
   */
  componentsCanvasRefIds: string[]
  setComponentsCanvasRefIds: (ids: string[]) => void
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
  const [componentsCanvasRefIds, setComponentsCanvasRefIds] = useState<string[]>(
    [],
  )
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
      if (!t && componentsCanvasRefIds.length === 0) {
        return { appended: [], error: null }
      }
      const gen = ++planGenRef.current
      const priorMessages = canvasPlanChatMessages
      const refLabels = componentsCanvasRefIds
        .map((id) => existingNodes.find((n) => n.id === id))
        .filter((n): n is CanvasNode => n != null)
        .map((n) => canvasMentionDisplayName(n))
      const basePrompt = t || REF_ONLY_PROMPT_FALLBACK
      const refOrderLine =
        refLabels.length > 0
          ? `\n\nReferenced components (in order): ${refLabels.join(', ')}`
          : ''
      const promptForApi = (basePrompt + refOrderLine).slice(0, 32000)
      const canvasRefs = buildCanvasReferencesForRequest(
        promptForApi,
        existingNodes,
        componentsCanvasRefIds,
      )
      const transcriptUserContent =
        t ||
        (refLabels.length > 0
          ? `Referenced: ${refLabels.join(', ')}`
          : promptForApi)
      setComponentsPromptDraft('')
      setComponentsCanvasRefIds([])
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
            canvas_references: canvasRefs,
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
            canvas_references: canvasRefs,
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
            { role: 'user', content: transcriptUserContent },
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
            { role: 'user', content: transcriptUserContent },
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
      componentsCanvasRefIds,
      componentsPromptDraft,
      componentsCanvasAiMode,
      extendedDesignContext,
    ],
  )

  const value = useMemo<ComponentsCanvasAiContextValue>(
    () => ({
      componentsPromptDraft,
      setComponentsPromptDraft,
      componentsCanvasRefIds,
      setComponentsCanvasRefIds,
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
      componentsCanvasRefIds,
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
