import type { LayoutRowStackBelow, LayoutSplitSidebarWidth } from '../types/layout-plan'

/**
 * Responsive row:
 * - Default / `sm`: side-by-side from 640px up (`flex-row` + `max-sm:flex-col` so narrow phones stack).
 * - `md` / `lg`: mobile-first (stack until that breakpoint).
 */
export function rowOuterFlexClass(
  stackBelow: LayoutRowStackBelow | undefined,
): string {
  const bp = stackBelow ?? 'sm'
  if (bp === 'md') {
    return 'flex min-w-0 flex-col md:flex-row md:items-start gap-4 md:gap-4'
  }
  if (bp === 'lg') {
    return 'flex min-w-0 flex-col lg:flex-row lg:items-start gap-4 lg:gap-4'
  }
  return 'flex min-w-0 flex-row items-start gap-4 max-sm:flex-col'
}

export function rowColumnClass(): string {
  return 'min-w-0 flex-1 flex flex-col gap-4'
}

export function splitOuterFlexClass(): string {
  return 'flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-6'
}

export function splitSidebarWidthClass(
  width: LayoutSplitSidebarWidth | undefined,
): string {
  const w = width ?? 'default'
  const map: Record<LayoutSplitSidebarWidth, string> = {
    narrow: 'w-full max-w-full lg:w-64',
    default: 'w-full max-w-full lg:w-72',
    wide: 'w-full max-w-full lg:w-80',
  }
  return `${map[w]} shrink-0 min-w-0 flex flex-col gap-4`
}

export function splitMainColumnClass(): string {
  return 'min-w-0 flex-1 flex flex-col gap-4'
}
