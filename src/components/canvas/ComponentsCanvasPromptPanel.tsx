import { RiArrowUpLine, RiAtLine, RiLoader4Line } from '@remixicon/react'
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
import {
  fillEditorFromSerialized,
  getSerializedCaretIndex,
  serializeEditorRoot,
  setCaretAtSerializedIndex,
} from '../../lib/canvas-html-prompt-dom'
import {
  makeCanvasRefSentinel,
  parseOrderedCanvasRefIds,
  removeFirstCanvasRefSentinel,
  stripCanvasRefSentinels,
} from '../../lib/canvas-prompt-sentinel'
import {
  buildInsertCanvasMentionSerialized,
  CanvasHtmlInlineComposer,
} from './CanvasHtmlInlineComposer'

export type ComponentsCanvasPromptPanelProps = {
  canvasNodes: CanvasNode[]
  value: string
  onChange: (v: string) => void
  canvasRefIds: string[]
  onCanvasRefIdsChange: (ids: string[]) => void
  onSubmit: () => void
  busy?: boolean
  placeholder?: string
  textareaId?: string
  extendedDesignContext: boolean
  onToggleExtendedDesignContext: () => void
  /** HTML mode: optional second model pass for theme spacing classes. */
  spacingEnforcement?: boolean
  onSpacingEnforcementChange?: (v: boolean) => void
  aiMode: ComponentsCanvasAiMode
  onAiModeChange: (mode: ComponentsCanvasAiMode) => void
  addAsNewInstead: boolean
  onAddAsNewInsteadChange: (v: boolean) => void
  className?: string
}

const shellClass =
  'w-full max-w-[min(560px,calc(100%-2rem))] rounded-xl border border-brandcolor-strokeweak bg-brandcolor-white/90 p-2 shadow-lg backdrop-blur-xl'

const COMPOSER_TEXTAREA_MIN_PX = 38
const COMPOSER_TEXTAREA_MAX_PX = 200

export function ComponentsCanvasPromptPanel({
  canvasNodes,
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
  spacingEnforcement = false,
  onSpacingEnforcementChange,
  aiMode,
  onAiModeChange,
  addAsNewInstead,
  onAddAsNewInsteadChange,
  className = '',
}: ComponentsCanvasPromptPanelProps) {
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const htmlEditorRef = useRef<HTMLDivElement>(null)
  const composerWrapRef = useRef<HTMLDivElement>(null)
  const [mentionHighlight, setMentionHighlight] = useState(0)
  const [caretTick, setCaretTick] = useState(0)
  const [caretSerialized, setCaretSerialized] = useState(0)
  const [mentionAnchorRect, setMentionAnchorRect] = useState<DOMRect | null>(
    null,
  )

  const fileBadgeTooltip = extendedDesignContext
    ? 'Theme guide is the base. Tap @ to send these files with each request. On — higher token use.'
    : 'Theme guide is the base. Tap @ to send these files with each request.'

  const strippedValue = useMemo(
    () => stripCanvasRefSentinels(value),
    [value],
  )
  const canSend =
    Boolean(strippedValue.trim() || canvasRefIds.length > 0) && !busy

  const mention = useMemo(() => {
    if (aiMode === 'htmlCreator') {
      return getOpenCanvasMentionAtCursor(value, caretSerialized, true)
    }
    const el = textareaRef.current
    const cursor = el?.selectionStart ?? value.length
    return getOpenCanvasMentionAtCursor(value, cursor, false)
  }, [value, aiMode, caretTick, caretSerialized])

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
    if (canvasRefIds.length !== 1) {
      onAddAsNewInsteadChange(false)
    }
  }, [canvasRefIds.length, onAddAsNewInsteadChange])

  useLayoutEffect(() => {
    if (!showMentionMenu) {
      setMentionAnchorRect(null)
      return
    }
    const el =
      aiMode === 'htmlCreator' ? htmlEditorRef.current : textareaRef.current
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
  }, [showMentionMenu, value, aiMode, caretTick, caretSerialized])

  const labelForId = useCallback(
    (id: string) => {
      const n = canvasNodes.find((x) => x.id === id)
      return n ? canvasMentionDisplayName(n) : id.slice(0, 8)
    },
    [canvasNodes],
  )

  const removeChipById = useCallback(
    (id: string) => {
      const root = htmlEditorRef.current
      if (!root) return
      const serialized = serializeEditorRoot(root)
      const next = removeFirstCanvasRefSentinel(serialized, id)
      fillEditorFromSerialized(root, next, labelForId, removeChipById)
      onChange(next)
      onCanvasRefIdsChange(parseOrderedCanvasRefIds(next))
    },
    [labelForId, onChange, onCanvasRefIdsChange],
  )

  const insertMentionHtml = useCallback(
    (node: CanvasNode) => {
      const root = htmlEditorRef.current
      if (!root || !mention) return
      const serialized = serializeEditorRoot(root)
      const sel = window.getSelection()
      if (!sel?.anchorNode || !root.contains(sel.anchorNode)) return
      const caret = getSerializedCaretIndex(
        root,
        sel.anchorNode,
        sel.anchorOffset,
      )
      const built = buildInsertCanvasMentionSerialized({
        node,
        mention,
        caretSerialized: caret,
        serialized,
      })
      if (!built) return
      fillEditorFromSerialized(root, built.next, labelForId, removeChipById)
      onChange(built.next)
      onCanvasRefIdsChange(parseOrderedCanvasRefIds(built.next))
      requestAnimationFrame(() => {
        root.focus()
        setCaretAtSerializedIndex(root, built.caretAfter)
        setCaretSerialized(built.caretAfter)
      })
    },
    [mention, labelForId, removeChipById, onChange, onCanvasRefIdsChange],
  )

  const insertMention = useCallback(
    (node: CanvasNode) => {
      if (aiMode === 'htmlCreator') {
        insertMentionHtml(node)
        return
      }
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
    [
      aiMode,
      insertMentionHtml,
      mention,
      onChange,
      value,
      canvasRefIds,
      onCanvasRefIdsChange,
    ],
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

  const onComposerCaptureKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (aiMode !== 'htmlCreator') return
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
      aiMode,
      canSend,
      insertMention,
      mention,
      mentionFiltered,
      mentionHighlight,
      onSubmit,
    ],
  )

  const handleAiModeChange = useCallback(
    (m: ComponentsCanvasAiMode) => {
      if (m === 'plan' && aiMode === 'htmlCreator') {
        const ids = parseOrderedCanvasRefIds(value)
        onChange(stripCanvasRefSentinels(value))
        onCanvasRefIdsChange(ids)
        onAddAsNewInsteadChange(false)
      }
      if (m === 'htmlCreator' && aiMode === 'plan') {
        const merged = [
          value.trim(),
          ...canvasRefIds.map((id) => makeCanvasRefSentinel(id)),
        ]
          .filter(Boolean)
          .join(' ')
        onChange(merged)
        onCanvasRefIdsChange(parseOrderedCanvasRefIds(merged))
      }
      onAiModeChange(m)
    },
    [
      aiMode,
      value,
      canvasRefIds,
      onChange,
      onCanvasRefIdsChange,
      onAiModeChange,
      onAddAsNewInsteadChange,
    ],
  )

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el || aiMode === 'htmlCreator') return
    el.style.height = 'auto'
    const h = Math.min(
      COMPOSER_TEXTAREA_MAX_PX,
      Math.max(COMPOSER_TEXTAREA_MIN_PX, el.scrollHeight),
    )
    el.style.height = `${h}px`
  }, [value, aiMode])

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
        aria-label="Components canvas prompt"
      >
        <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden">
          <div
            ref={composerWrapRef}
            onKeyDownCapture={onComposerCaptureKeyDown}
            className="relative flex min-w-0 shrink-0 flex-row flex-wrap items-end gap-x-2 gap-y-1 rounded-lg border-[0.8px] border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1.5 transition-[border-color] focus-within:border-brandcolor-primary"
          >
            {aiMode === 'htmlCreator' ? (
              <CanvasHtmlInlineComposer
                editorRef={htmlEditorRef}
                canvasNodes={canvasNodes}
                value={value}
                onChange={onChange}
                onRefIdsChange={onCanvasRefIdsChange}
                onCaretSerializedChange={(i) => {
                  setCaretSerialized(i)
                  setCaretTick((t) => t + 1)
                }}
                busy={Boolean(busy)}
                placeholder={placeholder}
                textareaId={textareaId}
              />
            ) : (
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
                style={{
                  minHeight: COMPOSER_TEXTAREA_MIN_PX,
                  maxHeight: COMPOSER_TEXTAREA_MAX_PX,
                }}
              />
            )}
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
            onClick={() => handleAiModeChange('plan')}
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
            onClick={() => handleAiModeChange('htmlCreator')}
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
          {aiMode === 'htmlCreator' && canvasRefIds.length === 1 ? (
            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-brandcolor-textweak">
              <input
                type="checkbox"
                className="rounded border-brandcolor-strokeweak"
                checked={addAsNewInstead}
                onChange={(e) =>
                  onAddAsNewInsteadChange(e.target.checked)
                }
              />
              <span className="text-brandcolor-textstrong">
                Add as new block instead
              </span>
            </label>
          ) : null}
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
          {aiMode === 'htmlCreator' && onSpacingEnforcementChange ? (
            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-brandcolor-textweak">
              <input
                type="checkbox"
                className="rounded border-brandcolor-strokeweak"
                checked={spacingEnforcement}
                onChange={(e) => onSpacingEnforcementChange(e.target.checked)}
                aria-label="Spacing pass: second model aligns gap and padding classes with theme tokens"
              />
              <span
                className="text-brandcolor-textstrong"
                title="Runs a second Vertex pass after HTML generation to map prompts like micro/cozy to gap-micro, p-cozy, etc. Extra latency and API cost. Safe fallback: if the pass fails, the first HTML is kept."
              >
                Spacing pass (2nd model)
              </span>
            </label>
          ) : null}
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
