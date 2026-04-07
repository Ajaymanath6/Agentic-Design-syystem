import themeGuide from '../config/theme-guide.json'
import type { LayoutThemeKey } from '../types/layout-plan'

type Guidelines = typeof themeGuide.componentGuidelines

/** Strip prose after " — " or " (" for guideline strings that mix description + classes. */
function classesFromGuidelineValue(raw: string): string {
  const t = raw.trim()
  const em = t.indexOf(' — ')
  if (em >= 0) {
    return t.slice(em + 3).trim().split(/\s+\(/)[0]?.trim() ?? t
  }
  const paren = t.indexOf(' (')
  if (paren >= 0) {
    return t.slice(0, paren).trim()
  }
  return t
}

function headingClasses(level: 'h1' | 'h2' | 'h3'): string {
  const h = (themeGuide.componentGuidelines as Guidelines).heading
  return h[level]
}

/**
 * Resolve allowed layout theme keys to Tailwind classes from theme-guide.json.
 * Only keys used in LayoutPlanV1 should appear here.
 */
export function getClassesForLayoutKey(key: LayoutThemeKey): string {
  const g = themeGuide.componentGuidelines as Guidelines
  switch (key) {
    case 'heading.h1':
      return headingClasses('h1')
    case 'heading.h2':
      return headingClasses('h2')
    case 'heading.h3':
      return headingClasses('h3')
    case 'profileCard.name':
      return classesFromGuidelineValue(g.profileCard.name)
    case 'profileCard.title':
      return classesFromGuidelineValue(g.profileCard.title)
    case 'profileCard.body':
      return classesFromGuidelineValue(g.profileCard.body)
    default: {
      const _exhaustive: never = key
      return _exhaustive
    }
  }
}

export const LAYOUT_THEME_KEYS: readonly LayoutThemeKey[] = [
  'heading.h1',
  'heading.h2',
  'heading.h3',
  'profileCard.name',
  'profileCard.title',
  'profileCard.body',
] as const

export function isLayoutThemeKey(s: string): s is LayoutThemeKey {
  return (LAYOUT_THEME_KEYS as readonly string[]).includes(s)
}

/** `componentGuidelines.input` — text fields in layout form shells. */
export function getThemeInputClasses(): string {
  const g = themeGuide.componentGuidelines as Guidelines & { input?: string }
  return typeof g.input === 'string' ? g.input : ''
}
