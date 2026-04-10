import {
  RiArrowUpLine,
  RiAtLine,
  RiCloseLine,
  RiLoader4Line,
} from '@remixicon/react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'

import type { ComponentsCanvasAiMode } from '../../context/ComponentsCanvasAiContext'
import type { CanvasNode } from '../../lib/canvas-node-publish'
import {
  canvasMentionDisplayName,
  getOpenCanvasMentionAtCursor,
  MAX_CANVAS_REFERENCE_BLOCKS,
} from '../../lib/canvas-node-llm-context'
import type { CanvasPlanChatMessage } from '../../types/components-canvas-plan-request'

export type ComponentsCanvasPromptPanelProps = {
  canvasNodes: CanvasNode[]
  canvasPlanChatMessages: CanvasPlanChatMessage[]
  value: string
  onChange: (v: string) => void
  /**
   * Picked blocks (badges); not written into `value` as `@canvas:` tokens.
   * Order matches pick order (left-to-right in the chip row).
   */
  canvasRefIds: string[]
  onCanvasRefIdsChange: (ids: string[]) => void
  onSubmit: () => void
  busy?: boolean
  placeholder?: string
  textareaId?: string
  extendedDesignContext: boolean
  onToggleExtendedDesignContext: () => void
  /** JSON plan vs HTML creator (parallel Vertex endpoints). */
  aiMode: ComponentsCanvasAiMode
  onAiModeChange: (mode: ComponentsCanvasAiMode) => void
  className?: string
}

const shellClass =
  'w-full max-w-[min(560px,calc(100%-2rem))] rounded-xl border border-brandcolor-strokeweak bg-brandcolor-white/90 p-2 shadow-lg backdrop-blur-xl'

/** Autosize textarea: start short, grow with prompt up to cap (px). */
const COMPOSER_TEXTAREA_MIN_PX = 38
const COMPOSER_TEXTAREA_MAX_PX = 200

/**
 * Chat transcript + composer for the components canvas (not used in layout sidebar).
 */
export function ComponentsCanvasPromptPanel({
  canvasNodes,
  canvasPlanChatMessages,
  value,
  onChange,
  canvasRefIds,
  onCanvasRefIdsChange,
  onSubmit,
  busy = false,
  placeholder = 'Describe components to add…',
  textareaId = 'components-canvas-ai-prompt',
  extendedDesignContext,
  onToggleExtendedDesignContext,
  aiMode,
  onAiModeChange,
  className = '',
}: ComponentsCanvasPromptPanelProps) {
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const composerWrapRef = useRef<HTMLDivElement>(null)
  const [mentionHighlight, setMentionHighlight] = useState(0)
  const [caretTick, setCaretTick] = useState(0)
  const [mentionAnchorRect, setMentionAnchorRect] = useState<DOMRect | null>(
    null,
  )

  const fileBadgeTooltip = extendedDesignContext
    ? 'Theme guide is the base. Tap @ to send these files with each request. On — higher token use.'
    : 'Theme guide is the base. Tap @ to send these files with each request.'

  const canSend =
    Boolean(value.trim() || canvasRefIds.length > 0) && !busy

  const mention = useMemo(() => {
    const el = textareaRef.current
    const cursor = el?.selectionStart ?? value.length
    return getOpenCanvasMentionAtCursor(value, cursor, aiMode === 'htmlCreator')
  }, [value, aiMode, caretTick])

  const mentionFiltered = useMemo(() => {
    if (!mention) return []
    const q = mention.filter.toLowerCase()
    return canvasNodes.filter((n) => {
      if (canvasRefIds.includes(n.id)) return false
      if (!q) return true
      const label = canvasMentionDisplayName(n).toLowerCase()
      return n.id.toLowerCase().includes(q) || label.includes(q)
    })
  }, [mention, canvasNodes, canvasRefIds])

  const showMentionMenu = Boolean(mention) && aiMode === 'htmlCreator'

  useEffect(() => {
    setMentionHighlight(0)
  }, [mention?.start, mention?.filter, mentionFiltered.length])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [canvasPlanChatMessages.length, busy])

  useLayoutEffect(() => {
    if (!showMentionMenu) {
      setMentionAnchorRect(null)
      return
    }
    const el = textareaRef.current
    if (!el) return
    const update = () => {
      setMentionAnchorRect(el.getBoundingClientRect())
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [showMentionMenu, value, caretTick])

  const insertMention = useCallback(
    (node: CanvasNode) => {
      const el = textareaRef.current
      if (!el || !mention) return
      const cursor = el.selectionStart ?? value.length
      const before = value.slice(0, mention.start)
      const after = value.slice(cursor)
      const next = `${before}${after}`.replace(/\s{2,}/g, ' ')
      onChange(next)
      if (!canvasRefIds.includes(node.id)) {
        if (canvasRefIds.length < MAX_CANVAS_REFERENCE_BLOCKS) {
          onCanvasRefIdsChange([...canvasRefIds, node.id])
        }
      }
      requestAnimationFrame(() => {
        const pos = Math.min(mention.start, next.length)
        el.focus()
        el.setSelectionRange(pos, pos)
      })
    },
    [mention, onChange, value, canvasRefIds, onCanvasRefIdsChange],
  )

  const onTextareaKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>): void => {
      if (mention && mentionFiltered.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setMentionHighlight((i) => (i + 1) % mentionFiltered.length)
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setMentionHighlight(
            (i) => (i - 1 + mentionFiltered.length) % mentionFiltered.length,
          )
          return
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          insertMention(mentionFiltered[mentionHighlight]!)
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          return
        }
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        if (!canSend) {
          e.preventDefault()
          return
        }
        e.preventDefault()
        onSubmit()
      }
    },
    [
      canSend,
      insertMention,
      mention,
      mentionFiltered,
      mentionHighlight,
      onSubmit,
    ],
  )

  const badgeNodes = useMemo(() => {
    const byId = new Map(canvasNodes.map((n) => [n.id, n]))
    return canvasRefIds
      .map((id) => {
        const node = byId.get(id)
        return node ? { id, node } : null
      })
      .filter((x): x is { id: string; node: CanvasNode } => x != null)
  }, [canvasRefIds, canvasNodes])

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const h = Math.min(
      COMPOSER_TEXTAREA_MAX_PX,
      Math.max(COMPOSER_TEXTAREA_MIN_PX, el.scrollHeight),
    )
    el.style.height = `${h}px`
  }, [value, aiMode, canvasRefIds.length])

  const mentionMenuPortal =
    typeof document !== 'undefined' &&
    showMentionMenu &&
    mentionAnchorRect &&
    createPortal(
      <ul
        className="max-h-48 min-w-[200px] max-w-[min(100vw-1rem,320px)] overflow-y-auto rounded-md border border-brandcolor-strokeweak/70 bg-brandcolor-white py-0.5 text-[13px] shadow-md"
        role="listbox"
        style={{
          position: 'fixed',
          zIndex: 200,
          left: Math.max(
            8,
            Math.min(
              mentionAnchorRect.left,
              window.innerWidth -
                Math.min(Math.max(mentionAnchorRect.width, 240), window.innerWidth - 16) -
                8,
            ),
          ),
          width: Math.min(
            Math.max(mentionAnchorRect.width, 240),
            window.innerWidth - 16,
          ),
          bottom: window.innerHeight - mentionAnchorRect.top + 8,
        }}
      >
        {mentionFiltered.length === 0 ? (
          <li
            className="px-2.5 py-1.5 text-[12px] text-brandcolor-textweak"
            role="presentation"
          >
            {canvasNodes.length === 0
              ? 'No blocks on canvas yet.'
              : 'No matching blocks.'}
          </li>
        ) : (
          mentionFiltered.map((n, idx) => (
            <li
              key={n.id}
              role="option"
              aria-selected={idx === mentionHighlight}
            >
              <button
                type="button"
                className={`block w-full truncate px-2.5 py-1.5 text-left text-brandcolor-textstrong ${
                  idx === mentionHighlight ? 'bg-brandcolor-fill' : ''
                }`}
                onMouseDown={(ev) => {
                  ev.preventDefault()
                  insertMention(n)
                }}
              >
                {canvasMentionDisplayName(n)}
              </button>
            </li>
          ))
        )}
      </ul>,
      document.body,
    )

  return (
    <div className={`${shellClass} ${className}`.trim()}>
      <div
        ref={listRef}
        className="flex max-h-[min(52vh,480px)] min-h-0 flex-col overflow-hidden"
        aria-label="Components canvas conversation and prompt"
      >
        {canvasPlanChatMessages.length > 0 ? (
          <div
            className="mb-2 max-h-[min(28vh,220px)] min-h-0 shrink-0 space-y-2 overflow-y-auto"
            aria-label="Components canvas conversation"
          >
            {canvasPlanChatMessages.map((m, i) => {
              const isUser = m.role === 'user'
              return (
                <div
                  key={`${i}-${m.role}-${m.content.slice(0, 24)}`}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={
                      isUser
                        ? 'max-w-[92%] rounded-lg rounded-br-sm bg-brandcolor-secondaryfill px-2.5 py-1.5 text-left text-[12px] leading-snug text-brandcolor-textstrong'
                        : 'max-w-[92%] rounded-lg rounded-bl-sm border border-brandcolor-strokeweak bg-brandcolor-white px-2.5 py-1.5 text-left text-[12px] leading-snug text-brandcolor-textweak'
                    }
                  >
                    <span className="sr-only">{isUser ? 'You' : 'Assistant'}: </span>
                    <span className="whitespace-pre-wrap break-words">{m.content}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden">
          <div
            ref={composerWrapRef}
            className="relative flex min-w-0 shrink-0 flex-row flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border-[0.8px] border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1.5 transition-[border-color] focus-within:border-brandcolor-primary"
          >
            {aiMode === 'htmlCreator' && badgeNodes.length > 0 ? (
              <div
                className="flex max-w-full shrink-0 flex-wrap items-center gap-1.5"
                aria-label="Canvas references in prompt"
              >
                {badgeNodes.map(({ id, node }) => (
                  <span
                    key={id}
                    className="inline-flex max-w-[min(100%,14rem)] items-center gap-0.5 rounded border border-brandcolor-strokeweak/60 bg-brandcolor-fill py-0.5 pl-1.5 pr-0.5 text-[10px] leading-tight text-brandcolor-textstrong sm:text-[11px]"
                    title={canvasMentionDisplayName(node)}
                  >
                    <span className="truncate">{canvasMentionDisplayName(node)}</span>
                    <button
                      type="button"
                      className="shrink-0 rounded p-0.5 hover:bg-brandcolor-white/60"
                      aria-label={`Remove reference ${canvasMentionDisplayName(node)}`}
                      onClick={() =>
                        onCanvasRefIdsChange(
                          canvasRefIds.filter((rid) => rid !== id),
                        )
                      }
                    >
                      <RiCloseLine className="size-3 shrink-0" aria-hidden />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <textarea
              ref={textareaRef}
              id={textareaId}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onTextareaKeyDown}
              onSelect={() => setCaretTick((t) => t + 1)}
              onClick={() => setCaretTick((t) => t + 1)}
              placeholder={placeholder}
              rows={1}
              disabled={busy}
              className="box-border min-h-0 min-w-[8rem] flex-1 resize-none overflow-y-auto border-0 bg-transparent py-1 text-[13px] leading-snug text-brandcolor-textstrong placeholder:text-brandcolor-textweak focus:outline-none focus:ring-0 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ minHeight: COMPOSER_TEXTAREA_MIN_PX, maxHeight: COMPOSER_TEXTAREA_MAX_PX }}
            />
          </div>

          <div ref={transcriptEndRef} className="shrink-0" />
        </div>
      </div>

      {mentionMenuPortal}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5"
          role="group"
          aria-label="AI mode: structured plan or HTML creator"
        >
          <button
            type="button"
            onClick={() => onAiModeChange('plan')}
            aria-pressed={aiMode === 'plan'}
            className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brandcolor-strokeweak focus-visible:ring-offset-1 focus-visible:ring-offset-brandcolor-white ${
              aiMode === 'plan'
                ? 'border-brandcolor-strokeweak bg-brandcolor-white text-brandcolor-textstrong'
                : 'border-transparent bg-transparent text-brandcolor-textweak hover:bg-brandcolor-white/80 hover:text-brandcolor-textstrong'
            }`}
          >
            Plan
          </button>
          <button
            type="button"
            onClick={() => onAiModeChange('htmlCreator')}
            aria-pressed={aiMode === 'htmlCreator'}
            title="Generates one HTML block via Vertex; client sanitizes with DOMPurify. Tailwind classes may need theme tokens to style correctly."
            className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brandcolor-strokeweak focus-visible:ring-offset-1 focus-visible:ring-offset-brandcolor-white ${
              aiMode === 'htmlCreator'
                ? 'border-brandcolor-strokeweak bg-brandcolor-white text-brandcolor-textstrong'
                : 'border-transparent bg-transparent text-brandcolor-textweak hover:bg-brandcolor-white/80 hover:text-brandcolor-textstrong'
            }`}
          >
            HTML
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5"
          aria-label="Design context: @ toggle and source files"
        >
          <button
            type="button"
            onClick={onToggleExtendedDesignContext}
            aria-pressed={extendedDesignContext}
            title={
              extendedDesignContext
                ? '@ is on: each request includes the full theme guide and Tailwind token file for the model.'
                : 'Turn @ on to attach the full theme guide and Tailwind tokens so new components follow your style system.'
            }
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-brandcolor-textstrong transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brandcolor-strokeweak focus-visible:ring-offset-1 focus-visible:ring-offset-brandcolor-white ${
              extendedDesignContext
                ? 'border-brandcolor-strokeweak bg-brandcolor-white'
                : 'border-brandcolor-strokeweak/70 bg-brandcolor-fill/80 hover:bg-brandcolor-fill'
            }`}
            aria-label={
              extendedDesignContext
                ? 'Extended design context enabled'
                : 'Enable extended design context'
            }
          >
            <RiAtLine className="size-4" aria-hidden />
          </button>
          <span
            className="inline-flex max-w-full cursor-default rounded-md border border-brandcolor-strokeweak/60 bg-brandcolor-fill px-1.5 py-0.5 font-mono text-[9px] leading-tight text-brandcolor-textstrong sm:text-[10px]"
            title={fileBadgeTooltip}
          >
            @src/config/theme-guide.json
          </span>
          <span
            className="inline-flex max-w-full cursor-default rounded-md border border-brandcolor-strokeweak/60 bg-brandcolor-fill px-1.5 py-0.5 font-mono text-[9px] leading-tight text-brandcolor-textstrong sm:text-[10px]"
            title={fileBadgeTooltip}
          >
            @tailwind.config.js
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSubmit()}
          disabled={!canSend}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brandcolor-primary text-brandcolor-white shadow-sm hover:bg-brandcolor-primaryhover disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Send prompt"
          title="Send"
          aria-busy={busy}
        >
          {busy ? (
            <RiLoader4Line className="size-4 animate-spin" aria-hidden />
          ) : (
            <RiArrowUpLine className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  )
}
