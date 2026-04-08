import {
  canvasCardCatalogId,
  canvasPrimaryButtonCatalogId,
  catalogImportIdFromKebabId,
} from './publish-component-id'

/** Published card width in `sourceHtml` (matches Components canvas card). */
export const CANVAS_CARD_PUBLISH_WIDTH_PX = 280

export type CanvasCardBlock = {
  kind: 'card'
  id: string
  x: number
  y: number
  title: string
  subtitle: string
  body: string
}

export type CanvasPrimaryButtonBlock = {
  kind: 'primaryButton'
  id: string
  x: number
  y: number
  label: string
}

export type CanvasNode = CanvasCardBlock | CanvasPrimaryButtonBlock

export function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Blueprint `sourceHtml` for catalog — matches on-card typography tokens. */
export function buildCanvasCardPublishHtml(n: CanvasCardBlock): string {
  const surface =
    'rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white shadow-card'
  return (
    `<article class="${surface} px-3 py-3" style="width:${CANVAS_CARD_PUBLISH_WIDTH_PX}px;box-sizing:border-box">` +
    `<h3 class="font-sans text-base font-semibold text-brandcolor-textstrong">${escapeHtmlText(n.title)}</h3>` +
    `<p class="mt-1 text-sm text-brandcolor-textweak">${escapeHtmlText(n.subtitle)}</p>` +
    `<p class="mt-2 text-sm leading-relaxed text-brandcolor-textweak">${escapeHtmlText(n.body)}</p>` +
    `</article>`
  )
}

/**
 * Static HTML for primary CTA; mirrors `primary-canvas-button` / theme-guide primary tokens.
 */
export function buildPrimaryButtonPublishHtml(n: CanvasPrimaryButtonBlock): string {
  const cls =
    'inline-flex items-center justify-center rounded-md border-0 px-4 py-2 text-sm font-medium text-brandcolor-white bg-brandcolor-primary hover:bg-brandcolor-primaryhover active:shadow-button-press focus:outline-none focus:ring-0'
  return `<button type="button" class="${cls}">${escapeHtmlText(n.label)}</button>`
}

export function componentCatalogIdForCanvasNode(n: CanvasNode): string {
  return n.kind === 'card'
    ? canvasCardCatalogId(n.id)
    : canvasPrimaryButtonCatalogId(n.id)
}

export function publishLabelForCanvasNode(n: CanvasNode): string {
  return n.kind === 'card' ? n.title : n.label
}

/** Shape aligned with server `buildBlueprint` / saved `.json` (preview before publish). */
export function buildBlueprintPreviewDocument(n: CanvasNode): Record<string, unknown> {
  const componentId = componentCatalogIdForCanvasNode(n)
  const label = publishLabelForCanvasNode(n)
  const importId = catalogImportIdFromKebabId(componentId)
  const sourceHtml =
    n.kind === 'card' ? buildCanvasCardPublishHtml(n) : buildPrimaryButtonPublishHtml(n)
  const thumbnailPublicPath = `/generated/${componentId}-thumbnail.png`
  return {
    schemaVersion: '1.0',
    id: componentId,
    component: 'div',
    importId,
    data: {
      imageUrl: thumbnailPublicPath,
      imageAlt: label,
      sourceHtml,
    },
  }
}

export function buildSourceHtmlForCanvasNode(n: CanvasNode): string {
  return n.kind === 'card'
    ? buildCanvasCardPublishHtml(n)
    : buildPrimaryButtonPublishHtml(n)
}
