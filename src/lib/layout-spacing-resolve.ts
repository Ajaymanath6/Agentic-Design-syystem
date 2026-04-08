/** Stack spacing tokens for LayoutPlanV1 — aligned with theme-guide.json spacing.scale */

/** Narrow shape for top-level vertical spacing (no import of layout-plan). */
type StackBlock = {
  type: 'chrome' | 'catalog' | 'row' | 'split'
  afterGap?: string
}

export type LayoutAfterGap = 'tight' | 'default' | 'section' | 'hero'

/** Used when token is missing/invalid and no neighbor inference applies. */
export const LAYOUT_AFTER_GAP_DEFAULT: LayoutAfterGap = 'section'

const MARGIN_BOTTOM: Record<LayoutAfterGap, string> = {
  tight: 'mb-2',
  default: 'mb-4',
  section: 'mb-6',
  hero: 'mb-8',
}

const ALLOWED = new Set<string>(['tight', 'default', 'section', 'hero'])

export function isLayoutAfterGap(s: string): s is LayoutAfterGap {
  return ALLOWED.has(s)
}

/**
 * When the plan omits afterGap and defaultAfterGap, infer rhythm from block pairs.
 * Row/split use space-4 (`default`) when followed by catalog/chrome (same as stacked
 * form blocks). Use `section` between layout regions (row↔split) or catalog→chrome.
 */
export function inferLayoutAfterGap(
  block: StackBlock,
  nextBlock: StackBlock,
): LayoutAfterGap {
  if (block.type === 'row' || block.type === 'split') {
    if (nextBlock.type === 'catalog' || nextBlock.type === 'chrome') {
      return 'default'
    }
    return 'section'
  }

  if (nextBlock.type === 'row' || nextBlock.type === 'split') {
    if (block.type === 'chrome' || block.type === 'catalog') {
      return 'default'
    }
    return 'section'
  }

  if (block.type === 'chrome' && nextBlock.type === 'catalog') {
    return 'default'
  }
  if (block.type === 'catalog' && nextBlock.type === 'catalog') {
    return 'default'
  }
  if (block.type === 'catalog' && nextBlock.type === 'chrome') {
    return 'section'
  }
  return 'section'
}

/**
 * Effective afterGap for a block: explicit block/plan values win, else neighbor inference.
 */
export function resolveLayoutAfterGap(
  block: StackBlock,
  nextBlock: StackBlock | undefined,
  planDefaultAfterGap: string | undefined,
): LayoutAfterGap {
  if (block.afterGap != null && isLayoutAfterGap(block.afterGap)) {
    return block.afterGap
  }
  if (
    planDefaultAfterGap != null &&
    isLayoutAfterGap(planDefaultAfterGap)
  ) {
    return planDefaultAfterGap
  }
  if (nextBlock != null) {
    return inferLayoutAfterGap(block, nextBlock)
  }
  return LAYOUT_AFTER_GAP_DEFAULT
}

/**
 * Maps afterGap token to Tailwind margin-bottom for space before the next block.
 * Unknown / undefined uses fallback (default `section` ≈ former space-y-6).
 */
export function getMarginBottomClassForAfterGap(
  token: string | undefined,
  fallback: LayoutAfterGap = LAYOUT_AFTER_GAP_DEFAULT,
): string {
  const t =
    token != null && isLayoutAfterGap(token) ? token : fallback
  return MARGIN_BOTTOM[t]
}
