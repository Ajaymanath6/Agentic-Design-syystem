import {
  HTML_SNIPPET_BLOCK_H,
  HTML_SNIPPET_BLOCK_W,
} from './append-html-snippet-canvas-node'
import {
  CANVAS_CARD_PUBLISH_WIDTH_PX,
  type CanvasNode,
} from './canvas-node-publish'
import { heightPxForProductSidebarPayload } from './canvas-product-sidebar-metrics'

const CANVAS_CARD_H = 200
const CANVAS_PRIMARY_W = 220
const CANVAS_PRIMARY_H = 112
const CANVAS_CONFIRM_PW_H = 152
const PRODUCT_SIDEBAR_W = 260

/** Width × height (px) for canvas layout — mirrors ComponentsCanvasSurface.nodeSize. */
export function canvasNodeFootprint(n: CanvasNode): { w: number; h: number } {
  if (n.kind === 'htmlSnippet') {
    const h = n.shellHeightPx ?? HTML_SNIPPET_BLOCK_H
    return { w: HTML_SNIPPET_BLOCK_W, h }
  }
  if (n.kind === 'productSidebar') {
    return {
      w: PRODUCT_SIDEBAR_W,
      h: heightPxForProductSidebarPayload({
        search_placeholder: n.search_placeholder,
        neutral_button_label: n.neutral_button_label,
        sections: n.sections.map((s) => ({
          items: s.items.map((it) => ({
            label: it.label,
            icon_key: it.icon_key,
          })),
        })),
      }),
    }
  }
  if (
    n.kind === 'primaryButton' ||
    n.kind === 'secondaryButton' ||
    n.kind === 'neutralButton'
  ) {
    return { w: CANVAS_PRIMARY_W, h: CANVAS_PRIMARY_H }
  }
  if (n.kind === 'confirmPasswordInput' || n.kind === 'textInputField') {
    return { w: CANVAS_CARD_PUBLISH_WIDTH_PX, h: CANVAS_CONFIRM_PW_H }
  }
  return { w: CANVAS_CARD_PUBLISH_WIDTH_PX, h: CANVAS_CARD_H }
}
