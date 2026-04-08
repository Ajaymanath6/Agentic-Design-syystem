import { findCardByPlanRef } from './layout-plan-catalog'
import {
  rowColumnClass,
  rowOuterFlexClass,
  splitMainColumnClass,
  splitOuterFlexClass,
  splitSidebarWidthClass,
} from './layout-row-split-classes'
import {
  getClassesForLayoutKey,
  isLayoutThemeKey,
} from './theme-guide-resolve'
import type { CatalogCardModel } from '../types/catalog'
import type {
  LayoutLeafBlock,
  LayoutPlanBlock,
  LayoutPlanV1,
} from '../types/layout-plan'

function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeClassAttr(s: string): string {
  return escapeHtmlText(s.replace(/\s+/g, ' ').trim())
}

function buildCatalogLeafHtml(
  block: Extract<LayoutLeafBlock, { type: 'catalog' }>,
  cards: CatalogCardModel[],
): string {
  const card = findCardByPlanRef(block.ref, cards)
  const html =
    card?.blueprint?.data &&
    typeof card.blueprint.data.sourceHtml === 'string'
      ? card.blueprint.data.sourceHtml.trim()
      : ''
  const count = Math.min(36, Math.max(1, block.repeat))
  if (!html) {
    return `<!-- catalog ref "${escapeHtmlText(block.ref)}" — no sourceHtml -->`
  }
  const chunks: string[] = []
  for (let j = 0; j < count; j++) {
    chunks.push(html)
  }
  return chunks.join('\n\n')
}

function buildChromeLeafHtml(block: Extract<LayoutLeafBlock, { type: 'chrome' }>): string {
  const tk = isLayoutThemeKey(block.titleThemeKey)
    ? block.titleThemeKey
    : 'heading.h2'
  const hClass = escapeClassAttr(getClassesForLayoutKey(tk))
  const parts: string[] = [
    `<h2 class="${hClass}">${escapeHtmlText(block.title)}</h2>`,
  ]
  if (block.subtitle) {
    const sk =
      block.subtitleThemeKey != null &&
      isLayoutThemeKey(block.subtitleThemeKey)
        ? block.subtitleThemeKey
        : 'profileCard.title'
    const pClass = escapeClassAttr(getClassesForLayoutKey(sk))
    parts.push(`<p class="${pClass}">${escapeHtmlText(block.subtitle)}</p>`)
  }
  return parts.join('\n')
}

function buildLeafHtml(leaf: LayoutLeafBlock, cards: CatalogCardModel[]): string {
  if (leaf.type === 'chrome') {
    return buildChromeLeafHtml(leaf)
  }
  return buildCatalogLeafHtml(leaf, cards)
}

function normalizeRowColumns(
  columns: { children: LayoutLeafBlock[] }[],
): LayoutLeafBlock[][] {
  return columns
    .map((c) => c.children)
    .filter((ch) => ch.length > 0)
    .slice(0, 4)
}

function buildLeavesColumnHtml(
  leaves: LayoutLeafBlock[],
  cards: CatalogCardModel[],
): string {
  const inner = leaves.map((l) => buildLeafHtml(l, cards)).join('\n\n')
  return `<div class="${escapeClassAttr(rowColumnClass())}">${inner}</div>`
}

function buildPlanBlockHtml(
  block: LayoutPlanBlock,
  cards: CatalogCardModel[],
): string {
  if (block.type === 'chrome' || block.type === 'catalog') {
    return buildLeafHtml(block, cards)
  }

  if (block.type === 'row') {
    const cols = normalizeRowColumns(block.columns)
    if (cols.length < 2) {
      return cols
        .flat()
        .map((l) => buildLeafHtml(l, cards))
        .join('\n\n')
    }
    const inner = cols
      .map((leaves) => buildLeavesColumnHtml(leaves, cards))
      .join('\n')
    const outer = escapeClassAttr(rowOuterFlexClass(block.stackBelow))
    return `<div class="${outer}" data-layout="row">${inner}</div>`
  }

  if (block.type === 'split') {
    const placementStart = block.sidebarPlacement !== 'end'
    const sideClass = escapeClassAttr(splitSidebarWidthClass(block.sidebarWidth))
    const mainClass = escapeClassAttr(splitMainColumnClass())
    const outer = escapeClassAttr(splitOuterFlexClass())
    const sideInner = block.sidebar
      .map((l) => buildLeafHtml(l, cards))
      .join('\n\n')
    const mainInner = block.main
      .map((l) => buildLeafHtml(l, cards))
      .join('\n\n')
    const sideDiv = `<div class="${sideClass}" data-region="sidebar">${sideInner}</div>`
    const mainDiv = `<div class="${mainClass}" data-region="main">${mainInner}</div>`
    const body = placementStart
      ? `${sideDiv}\n${mainDiv}`
      : `${mainDiv}\n${sideDiv}`
    return `<div class="${outer}" data-layout="split">${body}</div>`
  }

  return '<!-- unsupported block -->'
}

/**
 * Static HTML string mirroring structured preview: theme chrome (h2/p + Tailwind)
 * plus catalog sourceHtml; row/split wrappers match AdminLayoutStudio utilities.
 */
export function buildStructuredPreviewHtml(
  plan: LayoutPlanV1,
  cards: CatalogCardModel[],
): string {
  return plan.blocks
    .map((b) => buildPlanBlockHtml(b, cards))
    .join('\n\n')
}

/** Single root wrapper for blueprint `sourceHtml` when publishing a structured layout. */
export function wrapStructuredPreviewHtmlForPublish(innerHtml: string): string {
  const t = innerHtml.trim()
  if (!t) return ''
  return `<div class="flex min-w-0 w-full flex-col gap-0" data-published-layout="true">\n${t}\n</div>`
}
