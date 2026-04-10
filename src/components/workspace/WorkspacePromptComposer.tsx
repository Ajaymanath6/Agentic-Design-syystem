import {
  RiAddLine,
  RiArrowUpLine,
  RiLoader4Line,
} from '@remixicon/react'

export type WorkspacePromptComposerVariant = 'sidebar' | 'floating'

export type WorkspacePromptComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  busy?: boolean
  placeholder?: string
  variant?: WorkspacePromptComposerVariant
  /** Extra classes on the outer shell (inside sidebar border-t wrapper when sidebar). */
  className?: string
  textareaId?: string
}

const shellSidebar =
  'rounded-xl border border-brandcolor-strokeweak bg-brandcolor-fill p-2'
const shellFloating =
  'w-full max-w-[min(560px,calc(100%-2rem))] rounded-xl border border-brandcolor-strokeweak bg-brandcolor-white/85 p-2 shadow-lg backdrop-blur-xl'

/**
 * Shared “Ask…” composer: textarea, Add stub, send.
 * Layout sidebar uses `variant="sidebar"`; components canvas uses `variant="floating"`.
 */
export function WorkspacePromptComposer({
  value,
  onChange,
  onSubmit,
  busy = false,
  placeholder = 'Ask…',
  variant = 'sidebar',
  className = '',
  textareaId = 'workspace-prompt-composer',
}: WorkspacePromptComposerProps) {
  const shell = variant === 'floating' ? shellFloating : shellSidebar
  const canSend = Boolean(value.trim()) && !busy

  return (
    <div className={`${shell} ${className}`.trim()}>
      <textarea
        id={textareaId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            if (!canSend) {
              e.preventDefault()
              return
            }
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
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-brandcolor-strokeweak bg-brandcolor-white text-brandcolor-textstrong hover:bg-brandcolor-neutralhover"
          aria-label="Add"
        >
          <RiAddLine className="size-4" />
        </button>
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
