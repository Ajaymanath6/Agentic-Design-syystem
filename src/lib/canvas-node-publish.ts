import themeGuide from '../config/theme-guide.json'
import {
  canvasCardCatalogId,
  canvasConfirmPasswordInputCatalogId,
  canvasNeutralButtonCatalogId,
  canvasPrimaryButtonCatalogId,
  canvasSecondaryButtonCatalogId,
  canvasTextInputFieldCatalogId,
  catalogImportIdFromKebabId,
} from './publish-component-id'

/**
 * Published `sourceHtml`: card + primary/secondary read theme-guide equivalents; neutral +
 * confirm-password use constants here aligned with src/index.css.
 */
const cardSurfaceClasses = themeGuide.componentGuidelines.card
const primaryPublishClasses =
  themeGuide.componentGuidelines.button.primaryEquivalentTailwind
const secondaryPublishClasses =
  themeGuide.componentGuidelines.button.secondaryEquivalentTailwind

/** Must match `@apply` on `.neutral-canvas-button` in src/index.css. */
const NEUTRAL_CANVAS_BUTTON_PUBLISH_CLASSES =
  'inline-flex items-center justify-center rounded-md border border-1.5 border-brandcolor-strokeweak bg-brandcolor-white px-4 py-2 text-sm font-medium text-brandcolor-textstrong hover:bg-brandcolor-strokelight active:shadow-border-inset-strokelight focus:outline-none focus:ring-0 appearance-none'

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

export type CanvasSecondaryButtonBlock = {
  kind: 'secondaryButton'
  id: string
  x: number
  y: number
  label: string
}

export type CanvasNeutralButtonBlock = {
  kind: 'neutralButton'
  id: string
  x: number
  y: number
  label: string
}

export type CanvasConfirmPasswordInputBlock = {
  kind: 'confirmPasswordInput'
  id: string
  x: number
  y: number
  label: string
}

export type CanvasTextInputFieldBlock = {
  kind: 'textInputField'
  id: string
  x: number
  y: number
  label: string
}

export type CanvasNode =
  | CanvasCardBlock
  | CanvasPrimaryButtonBlock
  | CanvasSecondaryButtonBlock
  | CanvasNeutralButtonBlock
  | CanvasConfirmPasswordInputBlock
  | CanvasTextInputFieldBlock

export function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Blueprint `sourceHtml` for catalog — card shell from theme-guide `componentGuidelines.card`. */
export function buildCanvasCardPublishHtml(n: CanvasCardBlock): string {
  return (
    `<article class="${cardSurfaceClasses} px-3 py-3" style="width:${CANVAS_CARD_PUBLISH_WIDTH_PX}px;box-sizing:border-box">` +
    `<h3 class="font-sans text-base font-semibold text-brandcolor-textstrong">${escapeHtmlText(n.title)}</h3>` +
    `<p class="mt-1 text-sm text-brandcolor-textweak">${escapeHtmlText(n.subtitle)}</p>` +
    `<p class="mt-2 text-sm leading-relaxed text-brandcolor-textweak">${escapeHtmlText(n.body)}</p>` +
    `</article>`
  )
}

export function buildPrimaryButtonPublishHtml(n: CanvasPrimaryButtonBlock): string {
  return `<button type="button" class="${primaryPublishClasses}">${escapeHtmlText(n.label)}</button>`
}

export function buildSecondaryButtonPublishHtml(
  n: CanvasSecondaryButtonBlock,
): string {
  return `<button type="button" class="${secondaryPublishClasses}">${escapeHtmlText(n.label)}</button>`
}

export function buildNeutralButtonPublishHtml(n: CanvasNeutralButtonBlock): string {
  return `<button type="button" class="${NEUTRAL_CANVAS_BUTTON_PUBLISH_CLASSES}">${escapeHtmlText(n.label)}</button>`
}

export function buildConfirmPasswordInputPublishHtml(
  n: CanvasConfirmPasswordInputBlock,
): string {
  const fieldId = `confirm-pw-${n.id.replace(/[^a-zA-Z0-9-]/g, '-')}`
  return (
    `<div class="w-full" style="width:${CANVAS_CARD_PUBLISH_WIDTH_PX}px;box-sizing:border-box">` +
    `<label for="${fieldId}" class="mb-1 block text-xs font-medium text-brandcolor-textstrong">${escapeHtmlText(n.label)}</label>` +
    `<input id="${fieldId}" type="password" name="confirmPassword" autocomplete="new-password" class="confirm-password-canvas-input w-full" placeholder="••••••••" required minlength="8" />` +
    `</div>`
  )
}

export function buildTextInputFieldPublishHtml(n: CanvasTextInputFieldBlock): string {
  const fieldId = `text-field-${n.id.replace(/[^a-zA-Z0-9-]/g, '-')}`
  return (
    `<div class="w-full" style="width:${CANVAS_CARD_PUBLISH_WIDTH_PX}px;box-sizing:border-box">` +
    `<label for="${fieldId}" class="mb-1 block text-xs font-medium text-brandcolor-textstrong">${escapeHtmlText(n.label)}</label>` +
    `<input id="${fieldId}" type="text" name="textInputField" autocomplete="off" class="text-field-canvas-input w-full" placeholder="Type here…" required />` +
    `</div>`
  )
}

export function componentCatalogIdForCanvasNode(n: CanvasNode): string {
  if (n.kind === 'card') return canvasCardCatalogId(n.id)
  if (n.kind === 'primaryButton') return canvasPrimaryButtonCatalogId(n.id)
  if (n.kind === 'secondaryButton') return canvasSecondaryButtonCatalogId(n.id)
  if (n.kind === 'neutralButton') return canvasNeutralButtonCatalogId(n.id)
  if (n.kind === 'confirmPasswordInput') {
    return canvasConfirmPasswordInputCatalogId(n.id)
  }
  return canvasTextInputFieldCatalogId(n.id)
}

export function publishLabelForCanvasNode(n: CanvasNode): string {
  if (n.kind === 'card') return n.title
  return n.label
}

/** Shape aligned with server `buildBlueprint` / saved `.json` (preview before publish). */
export function buildBlueprintPreviewDocument(n: CanvasNode): Record<string, unknown> {
  const componentId = componentCatalogIdForCanvasNode(n)
  const label = publishLabelForCanvasNode(n)
  const importId = catalogImportIdFromKebabId(componentId)
  const sourceHtml =
    n.kind === 'card'
      ? buildCanvasCardPublishHtml(n)
      : n.kind === 'primaryButton'
        ? buildPrimaryButtonPublishHtml(n)
        : n.kind === 'secondaryButton'
          ? buildSecondaryButtonPublishHtml(n)
          : n.kind === 'neutralButton'
            ? buildNeutralButtonPublishHtml(n)
            : n.kind === 'confirmPasswordInput'
              ? buildConfirmPasswordInputPublishHtml(n)
              : buildTextInputFieldPublishHtml(n)
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
  if (n.kind === 'card') return buildCanvasCardPublishHtml(n)
  if (n.kind === 'primaryButton') return buildPrimaryButtonPublishHtml(n)
  if (n.kind === 'secondaryButton') return buildSecondaryButtonPublishHtml(n)
  if (n.kind === 'neutralButton') return buildNeutralButtonPublishHtml(n)
  if (n.kind === 'confirmPasswordInput') {
    return buildConfirmPasswordInputPublishHtml(n)
  }
  return buildTextInputFieldPublishHtml(n)
}
