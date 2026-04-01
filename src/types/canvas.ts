export type CanvasElement = {
  id: string
  /** Kebab-case id used for publish + blueprint file names */
  componentId: string
  type: string
  label: string
  /** Card preview only: line under the title (text-weak) */
  subtitle?: string
  /** Card / article body (text-weak) */
  paragraph?: string
  /** Optional second paragraph (e.g. article type) */
  paragraph2?: string
  x: number
  y: number
  width: number
  height: number
  published?: boolean
  figmaHtml?: string
}

/** Removed block ids (persisted) — survives refresh; merged with code scene on load. */
export const ADMIN_CANVAS_DELETED_IDS_KEY = 'admin-canvas-v2-deleted-ids'

/** Per-id layout + published flag for blocks still on canvas (persisted). */
export const ADMIN_CANVAS_LAYOUT_KEY = 'admin-canvas-v2-layout'
