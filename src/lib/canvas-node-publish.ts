import themeGuide from '../config/theme-guide.json'
import { PRODUCT_SIDEBAR_WIDTH_PX } from './canvas-product-sidebar-metrics'
import {
  canvasCardCatalogId,
  canvasConfirmPasswordInputCatalogId,
  canvasNeutralButtonCatalogId,
  canvasPrimaryButtonCatalogId,
  canvasProductSidebarCatalogId,
  canvasSecondaryButtonCatalogId,
  canvasTextInputFieldCatalogId,
  catalogImportIdFromKebabId,
} from './publish-component-id'
import type {
  ProductSidebarHeaderIconKey,
  ProductSidebarNavIconKey,
} from '../types/canvas-plan'

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

export type CanvasProductSidebarSectionBlock = {
  heading: string
  items: { label: string; icon_key: ProductSidebarNavIconKey }[]
}

export type CanvasProductSidebarBlock = {
  kind: 'productSidebar'
  id: string
  x: number
  y: number
  title: string
  trailing_icon_key: ProductSidebarHeaderIconKey
  search_placeholder: string
  neutral_button_label: string
  sections: CanvasProductSidebarSectionBlock[]
}

export type CanvasNode =
  | CanvasCardBlock
  | CanvasPrimaryButtonBlock
  | CanvasSecondaryButtonBlock
  | CanvasNeutralButtonBlock
  | CanvasConfirmPasswordInputBlock
  | CanvasTextInputFieldBlock
  | CanvasProductSidebarBlock

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

/**
 * Static `sourceHtml` for catalog: same tokens as the live block; nav rows are
 * text-only (icons are Remix-only in React preview).
 */
export function buildProductSidebarPublishHtml(n: CanvasProductSidebarBlock): string {
  const w = PRODUCT_SIDEBAR_WIDTH_PX
  const search = n.search_placeholder.trim()
  const neutral = n.neutral_button_label.trim()
  let inner = ''
  inner += `<header class="flex items-center justify-between gap-2 border-b border-brandcolor-strokeweak px-4 py-3">`
  inner += `<span class="min-w-0 truncate font-sans text-sm font-semibold text-brandcolor-textstrong">${escapeHtmlText(n.title)}</span>`
  inner += `</header>`
  if (search.length > 0) {
    const sid = `sidebar-search-${n.id.replace(/[^a-zA-Z0-9-]/g, '-')}`
    inner += `<div class="px-4 pt-3" style="box-sizing:border-box">`
    inner += `<input id="${sid}" type="search" name="sidebarSearch" autocomplete="off" class="text-field-canvas-input w-full" placeholder="${escapeHtmlText(search)}" />`
    inner += `</div>`
  }
  if (neutral.length > 0) {
    inner += `<div class="px-4 pt-3" style="box-sizing:border-box">`
    inner += `<button type="button" class="${NEUTRAL_CANVAS_BUTTON_PUBLISH_CLASSES} w-full">${escapeHtmlText(neutral)}</button>`
    inner += `</div>`
  }
  inner += `<nav class="flex flex-col gap-4 px-2 py-3" aria-label="Sidebar">`
  for (const sec of n.sections) {
    inner += `<div class="min-w-0">`
    inner += `<p class="px-2 text-[11px] font-semibold uppercase tracking-wide text-brandcolor-textweak">${escapeHtmlText(sec.heading)}</p>`
    inner += `<ul class="mt-1 space-y-0.5">`
    for (const it of sec.items) {
      inner += `<li><a href="#" class="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-brandcolor-textstrong hover:bg-brandcolor-fill">${escapeHtmlText(it.label)}</a></li>`
    }
    inner += `</ul></div>`
  }
  inner += `</nav>`
  return (
    `<aside class="flex min-h-0 flex-col overflow-hidden rounded-lg border-0 border-r border-brandcolor-strokeweak bg-brandcolor-white shadow-card" style="width:${w}px;box-sizing:border-box">` +
    inner +
    `</aside>`
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
  if (n.kind === 'productSidebar') {
    return canvasProductSidebarCatalogId(n.id)
  }
  return canvasTextInputFieldCatalogId(n.id)
}

export function publishLabelForCanvasNode(n: CanvasNode): string {
  if (n.kind === 'card' || n.kind === 'productSidebar') return n.title
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
              : n.kind === 'productSidebar'
                ? buildProductSidebarPublishHtml(n)
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
  if (n.kind === 'productSidebar') {
    return buildProductSidebarPublishHtml(n)
  }
  return buildTextInputFieldPublishHtml(n)
}
