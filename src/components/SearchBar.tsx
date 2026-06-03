import { MagnifyingGlass } from '@phosphor-icons/react'

export type SearchBarProps = {
  /** Shown inside the field when empty */
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  id?: string
  className?: string
}

/**
 * Search field on white with stroke-weak border; Phosphor duotone magnifying glass.
 */
export function SearchBar({
  placeholder = 'Search components…',
  value,
  onChange,
  id = 'sidebar-search',
  className = '',
}: SearchBarProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="px-1 text-xs text-brandcolor-textweak">
        Search
      </label>
      <div className="flex items-center gap-2 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-3 py-2">
        <MagnifyingGlass
          size={18}
          weight="duotone"
          className="shrink-0 text-brandcolor-textweak"
          aria-hidden
        />
        <input
          id={id}
          type="search"
          name="search"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-brandcolor-textstrong outline-none ring-0 placeholder:text-brandcolor-textweak focus:ring-0"
        />
      </div>
    </div>
  )
}
