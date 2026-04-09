/** Fixed preview width; matches theme-guide `componentsCanvasProductSidebar.widthPx`. */
export const PRODUCT_SIDEBAR_WIDTH_PX = 260

const HEADER_H = 52
const SEARCH_BLOCK_H = 52
const NEUTRAL_BLOCK_H = 48
const SECTION_TOP_GAP = 12
const SECTION_HEADING_H = 20
const ITEM_ROW_H = 36
const BOTTOM_PAD = 16
const MIN_H = 140
const MAX_H = 2000

/** Shape needed for height math (plan spec or stored canvas node). */
export type ProductSidebarHeightPayload = {
  search_placeholder: string
  neutral_button_label: string
  sections: { items: unknown[] }[]
}

/**
 * Vertical footprint for layout math (map → world placement, fit view, drag clamp).
 * Kept in sync with the preview component’s approximate layout.
 */
export function heightPxForProductSidebarPayload(
  spec: ProductSidebarHeightPayload,
): number {
  let h = HEADER_H
  if (spec.search_placeholder.trim().length > 0) {
    h += SEARCH_BLOCK_H
  }
  if (spec.neutral_button_label.trim().length > 0) {
    h += NEUTRAL_BLOCK_H
  }
  for (const sec of spec.sections) {
    h +=
      SECTION_TOP_GAP + SECTION_HEADING_H + (sec.items?.length ?? 0) * ITEM_ROW_H
  }
  h += BOTTOM_PAD
  return Math.min(MAX_H, Math.max(MIN_H, h))
}
