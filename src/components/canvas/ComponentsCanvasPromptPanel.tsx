import {
  RiArrowUpLine,
  RiAtLine,
  RiLoader4Line,
} from '@remixicon/react'
import { useEffect, useRef } from 'react'

import type { ComponentsCanvasAiMode } from '../../context/ComponentsCanvasAiContext'
import type { CanvasPlanChatMessage } from '../../types/components-canvas-plan-request'

export type ComponentsCanvasPromptPanelProps = {
  canvasPlanChatMessages: CanvasPlanChatMessage[]
  value: string
  onChange: (v: string) => void
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

/**
 * Chat transcript + composer for the components canvas (not used in layout sidebar).
 */
export function ComponentsCanvasPromptPanel({
  canvasPlanChatMessages,
  value,
  onChange,
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

  const fileBadgeTooltip = extendedDesignContext
    ? 'Theme guide is the base. Tap @ to send these files with each request. On — higher token use.'
    : 'Theme guide is the base. Tap @ to send these files with each request.'

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [canvasPlanChatMessages.length, busy])

  return (
    <div className={`${shellClass} ${className}`.trim()}>
      {canvasPlanChatMessages.length > 0 ? (
        <div
          ref={listRef}
          className="mb-2 max-h-[min(40vh,280px)] min-h-0 space-y-2 overflow-y-auto rounded-lg border border-brandcolor-strokeweak/60 bg-brandcolor-fill/50 px-2 py-2"
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
          <div ref={transcriptEndRef} />
        </div>
      ) : null}

      <textarea
        id={textareaId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSubmit()
          }
        }}
        placeholder={placeholder}
        rows={3}
        disabled={busy}
        className="mb-2 w-full resize-none rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white px-2.5 py-2 text-[13px] text-brandcolor-textstrong placeholder:text-brandcolor-textweak focus:outline-none focus:ring-2 focus:ring-brandcolor-primary disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
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
            className="inline-flex max-w-full cursor-default rounded-md border border-brandcolor-strokeweak bg-brandcolor-fill px-1.5 py-0.5 font-mono text-[9px] leading-tight text-brandcolor-textstrong sm:text-[10px]"
            title={fileBadgeTooltip}
          >
            @src/config/theme-guide.json
          </span>
          <span
            className="inline-flex max-w-full cursor-default rounded-md border border-brandcolor-strokeweak bg-brandcolor-fill px-1.5 py-0.5 font-mono text-[9px] leading-tight text-brandcolor-textstrong sm:text-[10px]"
            title={fileBadgeTooltip}
          >
            @tailwind.config.js
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSubmit()}
          disabled={busy}
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
