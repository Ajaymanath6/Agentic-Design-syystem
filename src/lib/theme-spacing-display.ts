import type { SpacingTokenKey } from '../config/theme-spacing-defaults'
import { validateSpacingValue } from './theme-token-validation'

/** Browser default used only for “≈ px” hints in the Theme UI and docs. */
export const SPACING_REFERENCE_ROOT_PX = 16

const REM_RE = /^(\d+(?:\.\d+)?)rem$/i
const PX_RE = /^(\d+(?:\.\d+)?)px$/i

/**
 * Human-readable approximate pixel label for a spacing token value.
 * Returns null if the value is not a valid rem/px spacing length.
 */
export function approxSpacingDisplayLabel(value: string): string | null {
  const ok = validateSpacingValue(value)
  if (!ok) return null
  const rem = REM_RE.exec(ok.trim())
  if (rem) {
    const n = Number.parseFloat(rem[1]!)
    if (!Number.isFinite(n)) return null
    const px = Math.round(n * SPACING_REFERENCE_ROOT_PX)
    return `≈ ${px}px @ ${SPACING_REFERENCE_ROOT_PX}px root`
  }
  const px = PX_RE.exec(ok.trim())
  if (px) {
    const n = Number.parseFloat(px[1]!)
    if (!Number.isFinite(n)) return null
    const rounded = Number.isInteger(n) ? String(n) : String(n)
    return `${rounded}px (fixed)`
  }
  return null
}

/** Example Tailwind utilities for prompts and the reference table. */
export function exampleTailwindForToken(key: SpacingTokenKey): string {
  switch (key) {
    case 'micro':
      return 'p-micro · gap-micro · m-micro'
    case 'tight':
      return 'p-tight · gap-tight · space-y-tight'
    case 'cozy':
      return 'p-cozy · px-cozy · gap-cozy'
    case 'section':
      return 'mt-section · gap-section · py-section'
    case 'hero':
      return 'mt-hero · gap-hero · mb-hero'
    case 'inline':
      return 'gap-inline · px-inline · space-x-inline'
    default: {
      const _exhaustive: never = key
      return _exhaustive
    }
  }
}

/** One-line “when to use” for the quick reference table. */
export function spacingUseWhenLine(key: SpacingTokenKey): string {
  switch (key) {
    case 'micro':
      return 'Icon-to-label hairline, densest inner rhythm'
    case 'tight':
      return 'Related lines inside a component (title + meta)'
    case 'cozy':
      return 'Default card / panel inner padding and stacks'
    case 'section':
      return 'Between major groups inside a page or form'
    case 'hero':
      return 'Strong break before first content or between sections'
    case 'inline':
      return 'Horizontal rows: chips, buttons, label + control'
    default: {
      const _exhaustive: never = key
      return _exhaustive
    }
  }
}
