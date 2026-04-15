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

import {
  createHtmlSnippetCanvasNode,
  mergeHtmlSnippetIntoNode,
} from '../lib/append-html-snippet-canvas-node'
import { coerceCanvasControlLabel } from '../lib/coerce-canvas-control-label'
import type { CanvasNode } from '../lib/canvas-node-publish'
import { sanitizeCanvasHtmlFragment } from '../lib/sanitize-canvas-html'
import { summarizeAppendedCanvasNodes } from '../lib/summarize-canvas-appended-nodes'
import {
  buildCanvasReferencesForRequest,
  canvasMentionDisplayName,
} from '../lib/canvas-node-llm-context'
import { stripCanvasRefSentinels } from '../lib/canvas-prompt-sentinel'
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

const SPACING_ENFORCEMENT_STORAGE_KEY = 'components-canvas-spacing-enforcement'

/** Backend requires non-empty prompt; used when the user only picked canvas refs (no typed text). */
const REF_ONLY_PROMPT_FALLBACK =
  'Use the referenced canvas blocks as context.'

const REPLACE_MODE_LLM_PREAMBLE =
  '[Replace mode] The user is replacing the single referenced canvas component. Return exactly one revised HTML fragment suitable for the canvas. Do not output multiple unrelated root widgets.\n\n'

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
  /** HTML creator: second Vertex pass for theme spacing class alignment (extra latency/cost). */
  spacingEnforcement: boolean
  setSpacingEnforcement: (v: boolean) => void
  componentsPlanBusy: boolean
  componentsPlanError: string | null
  /** `plan` = JSON node plan (`/canvas/plan`). `htmlCreator` = HTML fragment (`/canvas/generate-html`). */
  componentsCanvasAiMode: ComponentsCanvasAiMode
  setComponentsCanvasAiMode: (v: ComponentsCanvasAiMode) => void
  /**
   * When true (HTML mode, exactly one @ ref), append a new HTML block instead of merging into the referenced snippet.
   */
  componentsCanvasAddAsNewInstead: boolean
  setComponentsCanvasAddAsNewInstead: (v: boolean) => void
  /** Calls Vertex `/canvas/plan` or `/canvas/generate-html` per mode. Returns nodes to append. */
  submitComponentsPrompt: (
    existingNodes: CanvasNode[],
  ) => Promise<{
    appended: CanvasNode[]
    error: string | null
    replacedId: string | null
  }>
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
  const [spacingEnforcement, setSpacingEnforcementState] = useState(false)
  const [componentsPlanBusy, setComponentsPlanBusy] = useState(false)
  const [componentsPlanError, setComponentsPlanError] = useState<string | null>(
    null,
  )
  const [componentsCanvasAiMode, setComponentsCanvasAiModeState] =
    useState<ComponentsCanvasAiMode>('plan')
  const [componentsCanvasAddAsNewInstead, setComponentsCanvasAddAsNewInstead] =
    useState(false)
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
      const se = sessionStorage.getItem(SPACING_ENFORCEMENT_STORAGE_KEY)
      if (se === '1' || se === 'true') {
        setSpacingEnforcementState(true)
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

  const setSpacingEnforcement = useCallback((v: boolean) => {
    setSpacingEnforcementState(v)
    try {
      sessionStorage.setItem(SPACING_ENFORCEMENT_STORAGE_KEY, v ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [])

  const submitComponentsPrompt = useCallback(
    async (
      existingNodes: CanvasNode[],
    ): Promise<{
      appended: CanvasNode[]
      error: string | null
      replacedId: string | null
    }> => {
      const strippedDraft = stripCanvasRefSentinels(componentsPromptDraft)
      const t = strippedDraft.trim()
      if (!t && componentsCanvasRefIds.length === 0) {
        return { appended: [], error: null, replacedId: null }
      }
      const gen = ++planGenRef.current
      const priorMessages = canvasPlanChatMessages
      const refLabels = componentsCanvasRefIds
        .map((id) => existingNodes.find((n) => n.id === id))
        .filter((n): n is CanvasNode => n != null)
        .map((n) => canvasMentionDisplayName(n))
      const replaceActive =
        componentsCanvasAiMode === 'htmlCreator' &&
        componentsCanvasRefIds.length === 1 &&
        !componentsCanvasAddAsNewInstead
      const basePrompt = t || REF_ONLY_PROMPT_FALLBACK
      const modelPrompt = replaceActive
        ? `${REPLACE_MODE_LLM_PREAMBLE}${basePrompt}`
        : basePrompt
      const refOrderLine =
        refLabels.length > 0
          ? `\n\nReferenced components (in order): ${refLabels.join(', ')}`
          : ''
      const promptForApi = (modelPrompt + refOrderLine).slice(0, 32000)
      const canvasRefs = buildCanvasReferencesForRequest(
        promptForApi,
        existingNodes,
        componentsCanvasRefIds,
      )
      const transcriptUserContent =
        replaceActive && t
          ? `Update @ reference in place: ${t}`
          : t ||
            (refLabels.length > 0
              ? `Referenced: ${refLabels.join(', ')}`
              : promptForApi)
      const snapshot = {
        draft: componentsPromptDraft,
        refs: [...componentsCanvasRefIds],
        addAsNewInstead: componentsCanvasAddAsNewInstead,
      }
      setComponentsPromptDraft('')
      setComponentsCanvasRefIds([])
      setComponentsCanvasAddAsNewInstead(false)
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
            spacing_enforcement: spacingEnforcement,
            canvas_references: canvasRefs,
          })
          if (planGenRef.current !== gen) {
            return { appended: [], error: null, replacedId: null }
          }
          const safe = sanitizeCanvasHtmlFragment(res.html)
          if (!safe.trim()) {
            throw new Error('Model HTML was empty after sanitization')
          }
          const title = coerceCanvasControlLabel(res.title)
          if (
            replaceActive &&
            snapshot.refs.length === 1 &&
            componentsCanvasAiMode === 'htmlCreator'
          ) {
            const refId = snapshot.refs[0]!
            const target = existingNodes.find((n) => n.id === refId)
            if (target?.kind === 'htmlSnippet') {
              appended = [mergeHtmlSnippetIntoNode(target, safe, title)]
            } else {
              appended = [
                createHtmlSnippetCanvasNode(existingNodes, safe, title),
              ]
            }
          } else {
            appended = [
              createHtmlSnippetCanvasNode(existingNodes, safe, title),
            ]
          }
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
            return { appended: [], error: null, replacedId: null }
          }
          appended = mapCanvasPlanToNewNodes(plan, existingNodes)
        }
        if (planGenRef.current !== gen) {
          return { appended: [], error: null, replacedId: null }
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
        const replacedId =
          replaceActive &&
          componentsCanvasAiMode === 'htmlCreator' &&
          snapshot.refs.length === 1
            ? snapshot.refs[0]!
            : null
        return { appended, error: null, replacedId }
      } catch (e: unknown) {
        if (planGenRef.current !== gen) {
          return { appended: [], error: null, replacedId: null }
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
        return { appended: [], error: msg, replacedId: null }
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
      componentsCanvasAddAsNewInstead,
      extendedDesignContext,
      spacingEnforcement,
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
      spacingEnforcement,
      setSpacingEnforcement,
      componentsPlanBusy,
      componentsPlanError,
      componentsCanvasAiMode,
      setComponentsCanvasAiMode,
      componentsCanvasAddAsNewInstead,
      setComponentsCanvasAddAsNewInstead,
      submitComponentsPrompt,
    }),
    [
      componentsCanvasRefIds,
      componentsPromptDraft,
      canvasPlanChatMessages,
      extendedDesignContext,
      spacingEnforcement,
      componentsPlanBusy,
      componentsPlanError,
      componentsCanvasAiMode,
      setComponentsCanvasAiMode,
      componentsCanvasAddAsNewInstead,
      submitComponentsPrompt,
      setExtendedDesignContext,
      setSpacingEnforcement,
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
