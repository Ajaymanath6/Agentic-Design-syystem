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
import { useLayoutWorkspace } from '../../context/LayoutWorkspaceContext'
import { catalogCardDisplayName } from '../../lib/catalog-display-name'
import type { CatalogCardModel } from '../../types/catalog'
import {
  getOpenLayoutCatalogMentionAtCursor,
  MAX_LAYOUT_CATALOG_REFERENCE_BLOCKS,
} from '../../lib/layout-prompt-mentions'

const shellSidebar =
  'rounded-xl border border-brandcolor-strokeweak bg-brandcolor-fill p-2'

const COMPOSER_TEXTAREA_MIN_PX = 38
const COMPOSER_TEXTAREA_MAX_PX = 200

const segBase =
  'flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-center text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brandcolor-strokeweak focus-visible:ring-offset-1 focus-visible:ring-offset-brandcolor-fill'
const segInactive =
  'border-transparent text-brandcolor-textweak hover:bg-brandcolor-white/70 hover:text-brandcolor-textstrong'
const segActive =
  'border-brandcolor-strokeweak bg-brandcolor-white text-brandcolor-textstrong shadow-none'

export function LayoutPromptPanel() {
  const {
    layoutPromptDraft,
    setLayoutPromptDraft,
    layoutCatalogRefIds,
    setLayoutCatalogRefIds,
    submitLayoutPrompt,
    layoutPlanBusy,
    layoutWorkspaceMode,
    setLayoutWorkspaceMode,
    layoutHtmlBusy,
    extendedLayoutDesignContext,
    setExtendedLayoutDesignContext,
    layoutHtmlSpacingEnforcement,
    setLayoutHtmlSpacingEnforcement,
    layoutMentionCards,
  } = useLayoutWorkspace()

  const layoutSubmitBusy = layoutWorkspaceMode === 'plan' ? layoutPlanBusy : layoutHtmlBusy

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  /** Cursor index for @-mention parsing (avoid reading ref during render). */
  const [cursorPos, setCursorPos] = useState(0)
  const [mentionHighlight, setMentionHighlight] = useState(0)
  const [mentionAnchorRect, setMentionAnchorRect] = useState<DOMRect | null>(
    null,
  )

  const value = layoutPromptDraft
  const onChange = setLayoutPromptDraft

  const mention = useMemo(
    () => getOpenLayoutCatalogMentionAtCursor(value, cursorPos),
    [value, cursorPos],
  )

  const mentionFiltered = useMemo(() => {
    if (!mention) return []
    const q = mention.filter.toLowerCase()
    return layoutMentionCards.filter((c) => {
      if (layoutCatalogRefIds.includes(c.entry.id)) return false
      if (!q) return true
      const label = catalogCardDisplayName(c).toLowerCase()
      return (
        c.entry.id.toLowerCase().includes(q) ||
        label.includes(q) ||
        (c.entry.importId?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [mention, layoutMentionCards, layoutCatalogRefIds])

  const showMentionMenu = Boolean(mention)

  useEffect(() => {
    queueMicrotask(() => setMentionHighlight(0))
  }, [mention?.start, mention?.filter, mentionFiltered.length])

  useLayoutEffect(() => {
    if (!showMentionMenu || !mention) {
      queueMicrotask(() => setMentionAnchorRect(null))
      return
    }
    const el = textareaRef.current
    if (!el) return
    const update = () => setMentionAnchorRect(el.getBoundingClientRect())
    queueMicrotask(update)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [showMentionMenu, mention, value, cursorPos])

  const canSend =
    (Boolean(value.trim()) || layoutCatalogRefIds.length > 0) &&
    !layoutSubmitBusy

  const insertMention = useCallback(
    (card: CatalogCardModel) => {
      const el = textareaRef.current
      if (!el || !mention) return
      const cursor = el.selectionStart ?? value.length
      const before = value.slice(0, mention.start)
      const after = value.slice(cursor)
      const next = `${before}${after}`.replace(/\s{2,}/g, ' ')
      onChange(next)
      if (!layoutCatalogRefIds.includes(card.entry.id)) {
        if (layoutCatalogRefIds.length < MAX_LAYOUT_CATALOG_REFERENCE_BLOCKS) {
          setLayoutCatalogRefIds([...layoutCatalogRefIds, card.entry.id])
        }
      }
      requestAnimationFrame(() => {
        const pos = Math.min(mention.start, next.length)
        el.focus()
        el.setSelectionRange(pos, pos)
        setCursorPos(pos)
      })
    },
    [
      mention,
      value,
      onChange,
      layoutCatalogRefIds,
      setLayoutCatalogRefIds,
    ],
  )

  const removeRefId = useCallback(
    (id: string) => {
      setLayoutCatalogRefIds((prev) => prev.filter((x) => x !== id))
    },
    [setLayoutCatalogRefIds],
  )

  const labelForEntryId = useCallback(
    (id: string) => {
      const c = layoutMentionCards.find((x) => x.entry.id === id)
      return c ? catalogCardDisplayName(c) : id.slice(0, 12)
    },
    [layoutMentionCards],
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
        submitLayoutPrompt()
      }
    },
    [
      canSend,
      insertMention,
      mention,
      mentionFiltered,
      mentionHighlight,
      submitLayoutPrompt,
    ],
  )

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const h = Math.min(
      COMPOSER_TEXTAREA_MAX_PX,
      Math.max(COMPOSER_TEXTAREA_MIN_PX, el.scrollHeight),
    )
    el.style.height = `${h}px`
  }, [value])

  const mentionMenuPortal =
    typeof document !== 'undefined' &&
    showMentionMenu &&
    mention &&
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
                Math.min(
                  Math.max(mentionAnchorRect.width, 240),
                  window.innerWidth - 16,
                ) -
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
            {layoutMentionCards.length === 0
              ? 'No published components in catalog yet.'
              : 'No matching components.'}
          </li>
        ) : (
          mentionFiltered.map((c, idx) => (
            <li
              key={c.entry.id}
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
                  insertMention(c)
                }}
              >
                {catalogCardDisplayName(c)}
              </button>
            </li>
          ))
        )}
      </ul>,
      document.body,
    )

  return (
    <div className={shellSidebar}>
      <div
        className="mb-2 flex gap-0.5 rounded-lg bg-brandcolor-fill p-1"
        role="group"
        aria-label="Layout output mode"
      >
        <button
          type="button"
          className={`${segBase} ${layoutWorkspaceMode === 'plan' ? segActive : segInactive}`}
          aria-pressed={layoutWorkspaceMode === 'plan'}
          onClick={() => setLayoutWorkspaceMode('plan')}
        >
          Plan (JSON)
        </button>
        <button
          type="button"
          className={`${segBase} ${layoutWorkspaceMode === 'html' ? segActive : segInactive}`}
          aria-pressed={layoutWorkspaceMode === 'html'}
          onClick={() => setLayoutWorkspaceMode('html')}
        >
          Generate HTML
        </button>
      </div>
      {layoutWorkspaceMode === 'html' ? (
        <div className="mb-2 flex flex-col gap-1.5 text-[11px] text-brandcolor-textweak">
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              className="rounded border-brandcolor-strokeweak"
              checked={extendedLayoutDesignContext}
              onChange={(e) => setExtendedLayoutDesignContext(e.target.checked)}
            />
            <span className="text-brandcolor-textstrong">
              Extended theme + Tailwind context
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              className="rounded border-brandcolor-strokeweak"
              checked={layoutHtmlSpacingEnforcement}
              onChange={(e) => setLayoutHtmlSpacingEnforcement(e.target.checked)}
            />
            <span
              className="text-brandcolor-textstrong"
              title="Second model pass to align spacing utilities with theme tokens. Extra latency."
            >
              Spacing pass (2nd model)
            </span>
          </label>
        </div>
      ) : null}
      <div className="relative flex min-w-0 flex-col gap-1.5 rounded-lg border-[0.8px] border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1.5 transition-[border-color] focus-within:border-brandcolor-primary">
        {layoutCatalogRefIds.length > 0 ? (
          <div
            className="flex flex-wrap gap-1"
            role="group"
            aria-label="Referenced catalog components"
          >
            {layoutCatalogRefIds.map((id) => (
              <span
                key={id}
                className="inline-flex max-w-full items-center gap-0.5 rounded-md bg-brandcolor-fill py-0.5 pl-1.5 pr-0.5 text-[11px] font-medium text-brandcolor-textstrong"
              >
                <span className="min-w-0 truncate">{labelForEntryId(id)}</span>
                <button
                  type="button"
                  className="shrink-0 rounded p-0.5 text-brandcolor-textweak hover:bg-brandcolor-white hover:text-brandcolor-textstrong"
                  aria-label={`Remove ${labelForEntryId(id)}`}
                  onClick={() => removeRefId(id)}
                >
                  <RiCloseLine className="size-3.5" aria-hidden />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <textarea
          ref={textareaRef}
          id="layout-workspace-prompt"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setCursorPos(e.target.selectionStart ?? e.target.value.length)
          }}
          onKeyDown={onTextareaKeyDown}
          onSelect={(e) =>
            setCursorPos(e.currentTarget.selectionStart ?? 0)
          }
          onClick={(e) =>
            setCursorPos(e.currentTarget.selectionStart ?? 0)
          }
          placeholder={
            layoutWorkspaceMode === 'plan'
              ? 'Ask… (type @ to pick published components)'
              : 'Describe the layout or section to generate… (@ for catalog HTML context)'
          }
          rows={1}
          disabled={layoutSubmitBusy}
          className="box-border min-h-0 min-w-[8rem] w-full resize-none overflow-y-auto border-0 bg-transparent py-1 text-[13px] leading-snug text-brandcolor-textstrong placeholder:text-brandcolor-textweak focus:outline-none focus:ring-0 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            minHeight: COMPOSER_TEXTAREA_MIN_PX,
            maxHeight: COMPOSER_TEXTAREA_MAX_PX,
          }}
        />
      </div>

      {mentionMenuPortal}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-brandcolor-strokeweak bg-brandcolor-white text-brandcolor-textweak hover:bg-brandcolor-neutralhover"
          aria-label="Type @ in the field to reference catalog components"
          title="@ mention"
          onClick={() => {
            const el = textareaRef.current
            if (!el) return
            const pos = el.selectionStart ?? value.length
            const next = `${value.slice(0, pos)}@${value.slice(pos)}`
            onChange(next)
            requestAnimationFrame(() => {
              el.focus()
              const insertAt = pos + 1
              el.setSelectionRange(insertAt, insertAt)
              setCursorPos(insertAt)
            })
          }}
        >
          <RiAtLine className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => submitLayoutPrompt()}
          disabled={!canSend}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brandcolor-primary text-brandcolor-white shadow-sm hover:bg-brandcolor-primaryhover disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Send layout prompt"
          title="Send"
          aria-busy={layoutSubmitBusy}
        >
          {layoutSubmitBusy ? (
            <RiLoader4Line className="size-4 animate-spin" aria-hidden />
          ) : (
            <RiArrowUpLine className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  )
}
