import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type RefObject,
} from 'react'

import {
  fillEditorFromSerialized,
  getSerializedCaretIndex,
  serializeEditorRoot,
} from '../../lib/canvas-html-prompt-dom'
import {
  canvasMentionDisplayName,
  MAX_CANVAS_REFERENCE_BLOCKS,
} from '../../lib/canvas-node-llm-context'
import type { CanvasNode } from '../../lib/canvas-node-publish'
import {
  makeCanvasRefSentinel,
  parseOrderedCanvasRefIds,
  removeFirstCanvasRefSentinel,
} from '../../lib/canvas-prompt-sentinel'

type Props = {
  editorRef: RefObject<HTMLDivElement | null>
  canvasNodes: CanvasNode[]
  value: string
  onChange: (serialized: string) => void
  onRefIdsChange: (ids: string[]) => void
  onCaretSerializedChange: (index: number) => void
  busy: boolean
  placeholder?: string
  textareaId: string
}

/**
 * HTML-mode prompt: contenteditable with inline ref chips; `value` uses `[[canvas-ref:uuid]]` sentinels.
 */
export function CanvasHtmlInlineComposer({
  editorRef,
  canvasNodes,
  value,
  onChange,
  onRefIdsChange,
  onCaretSerializedChange,
  busy,
  placeholder,
  textareaId,
}: Props) {
  const rootRef = editorRef as MutableRefObject<HTMLDivElement | null>
  const isComposingRef = useRef(false)

  const labelForId = useCallback(
    (id: string) => {
      const n = canvasNodes.find((x) => x.id === id)
      return n ? canvasMentionDisplayName(n) : id.slice(0, 8)
    },
    [canvasNodes],
  )

  const nodeLabelKey = useMemo(
    () =>
      canvasNodes
        .map((n) => `${n.id}:${canvasMentionDisplayName(n)}`)
        .join('|'),
    [canvasNodes],
  )

  const removeChip = useCallback(
    (id: string) => {
      const root = rootRef.current
      if (!root) return
      const serialized = serializeEditorRoot(root)
      const next = removeFirstCanvasRefSentinel(serialized, id)
      fillEditorFromSerialized(root, next, labelForId, removeChip)
      onChange(next)
      onRefIdsChange(parseOrderedCanvasRefIds(next))
      requestAnimationFrame(() => root.focus())
    },
    [labelForId, onChange, onRefIdsChange, rootRef],
  )

  const flushFromDom = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    const serialized = serializeEditorRoot(root)
    onChange(serialized)
    onRefIdsChange(parseOrderedCanvasRefIds(serialized))
  }, [onChange, onRefIdsChange, rootRef])

  const prevLabelKey = useRef(nodeLabelKey)
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const current = serializeEditorRoot(root)
    const labelBump = prevLabelKey.current !== nodeLabelKey
    prevLabelKey.current = nodeLabelKey
    if (current !== value || labelBump) {
      fillEditorFromSerialized(root, value, labelForId, removeChip)
    }
  }, [value, nodeLabelKey, labelForId, removeChip, rootRef])

  const updateCaret = useCallback(() => {
    const root = rootRef.current
    const sel = window.getSelection()
    if (!root || !sel?.anchorNode || !root.contains(sel.anchorNode)) {
      onCaretSerializedChange(value.length)
      return
    }
    onCaretSerializedChange(
      getSerializedCaretIndex(root, sel.anchorNode, sel.anchorOffset),
    )
  }, [onCaretSerializedChange, value.length, rootRef])

  useEffect(() => {
    const onSel = () => {
      if (!isComposingRef.current) updateCaret()
    }
    document.addEventListener('selectionchange', onSel)
    return () => document.removeEventListener('selectionchange', onSel)
  }, [updateCaret])

  return (
    <div className="relative min-w-0 flex-1">
      {value.length === 0 ? (
        <span
          className="pointer-events-none absolute left-0 top-1 z-0 select-none text-[13px] leading-snug text-brandcolor-textweak"
          aria-hidden
        >
          {placeholder}
        </span>
      ) : null}
      <div
        ref={rootRef}
        id={textareaId}
        role="textbox"
        aria-multiline="true"
        contentEditable={!busy}
        suppressContentEditableWarning
        onInput={() => {
          if (isComposingRef.current) return
          flushFromDom()
          updateCaret()
        }}
        onCompositionStart={() => {
          isComposingRef.current = true
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false
          flushFromDom()
          updateCaret()
        }}
        onBlur={() => flushFromDom()}
        className="relative z-[1] min-h-[38px] max-h-[200px] min-w-[8rem] overflow-y-auto whitespace-pre-wrap break-words border-0 bg-transparent py-1 text-left text-[13px] leading-snug text-brandcolor-textstrong outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  )
}

export type CanvasMentionInsertContext = {
  node: CanvasNode
  mention: { start: number; filter: string }
  caretSerialized: number
  serialized: string
}

export function buildInsertCanvasMentionSerialized(
  ctx: CanvasMentionInsertContext,
): { next: string; caretAfter: number } | null {
  const { node, mention, caretSerialized, serialized } = ctx
  const ordered = parseOrderedCanvasRefIds(serialized)
  const before = serialized.slice(0, mention.start)
  const after = serialized.slice(caretSerialized)
  if (ordered.includes(node.id)) {
    const next = `${before}${after}`.replace(/\s{2,}/g, ' ')
    const caretAfter = Math.min(mention.start, next.length)
    return { next, caretAfter }
  }
  if (ordered.length >= MAX_CANVAS_REFERENCE_BLOCKS) {
    return null
  }
  const sentinel = makeCanvasRefSentinel(node.id)
  const next = `${before}${sentinel}${after}`.replace(/\s{2,}/g, ' ')
  const caretAfter = before.length + sentinel.length
  return { next, caretAfter }
}
