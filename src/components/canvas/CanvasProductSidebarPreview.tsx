import type { CanvasProductSidebarBlock } from '../../lib/canvas-node-publish'
import {
  ProductSidebarHeaderIconGlyph,
  ProductSidebarNavIconGlyph,
} from './canvas-product-sidebar-icons'

type Props = {
  node: CanvasProductSidebarBlock
  /** Hide Published badge row during screenshot capture */
  hideBadgeRow: boolean
  published: boolean
  publishedBadgeClass: string
  draftBadgeClass: string
}

export function CanvasProductSidebarPreview({
  node,
  hideBadgeRow,
  published,
  publishedBadgeClass,
  draftBadgeClass,
}: Props) {
  const search = node.search_placeholder.trim()
  const neutral = node.neutral_button_label.trim()

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!hideBadgeRow ? (
        <div className="mb-2 flex items-start justify-end gap-2 px-3">
          <span
            className={published ? publishedBadgeClass : draftBadgeClass}
            data-canvas-catalog-badge
            aria-label={
              published
                ? 'Published to catalog — republishing updates the same entry'
                : 'Not in catalog yet — use Publish on the block'
            }
          >
            {published ? 'Published' : 'Not published'}
          </span>
        </div>
      ) : null}
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-brandcolor-strokeweak px-4 py-3">
        <span className="min-w-0 truncate font-sans text-sm font-semibold text-brandcolor-textstrong">
          {node.title}
        </span>
        <ProductSidebarHeaderIconGlyph
          iconKey={node.trailing_icon_key}
          className="size-4 shrink-0 text-brandcolor-textweak"
        />
      </header>
      {search.length > 0 ? (
        <div
          className="shrink-0 px-4 pt-3"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <input
            id={`sidebar-search-${node.id}`}
            type="search"
            name="sidebarSearch"
            autoComplete="off"
            className="text-field-canvas-input w-full"
            placeholder={search}
            aria-label={search}
          />
        </div>
      ) : null}
      {neutral.length > 0 ? (
        <div className="shrink-0 px-4 pt-3">
          <button
            type="button"
            className="neutral-canvas-button pointer-events-none w-full select-none px-4 py-2.5 text-sm font-semibold"
            tabIndex={-1}
            aria-hidden
          >
            {neutral}
          </button>
        </div>
      ) : null}
      <nav
        className="min-h-0 flex-1 overflow-y-auto px-2 py-3"
        aria-label="Sidebar sections"
      >
        <div className="flex flex-col gap-4">
          {node.sections.map((sec, si) => (
            <div key={`${sec.heading}-${si}`} className="min-w-0">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-brandcolor-textweak">
                {sec.heading}
              </p>
              <ul className="mt-1 space-y-0.5">
                {sec.items.map((it, ii) => (
                  <li key={`${it.label}-${ii}`}>
                    <div className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-brandcolor-textstrong hover:bg-brandcolor-fill">
                      <ProductSidebarNavIconGlyph
                        iconKey={it.icon_key}
                        className="size-4 shrink-0 text-brandcolor-textweak"
                      />
                      <span className="min-w-0 truncate">{it.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}
