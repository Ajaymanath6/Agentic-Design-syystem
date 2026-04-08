import type { ReactNode } from 'react'

/**
 * Toolbar control used in CatalogDetailModal (Code, JSON, etc.) — reuse for layout studio.
 */
export function CatalogDetailToolbarButton({
  label,
  active,
  onClick,
  ariaPressed,
  title,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  ariaPressed?: boolean
  title?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={title ?? label}
      aria-label={label}
      aria-pressed={ariaPressed}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brandcolor-primary focus-visible:ring-offset-2 ${
        active
          ? 'bg-brandcolor-fill text-brandcolor-textstrong'
          : 'text-brandcolor-textweak hover:bg-brandcolor-fill hover:text-brandcolor-textstrong'
      }`}
    >
      <span className="whitespace-nowrap">{label}</span>
      <span className="flex shrink-0 items-center [&>svg]:size-5" aria-hidden>
        {children}
      </span>
    </button>
  )
}
