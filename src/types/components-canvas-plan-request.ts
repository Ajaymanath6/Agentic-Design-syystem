/** Request body for `POST /canvas/plan` (mirrors Python `CanvasPlanPromptBody`). */

export type CanvasPlanChatRole = 'user' | 'assistant'

export type CanvasPlanChatMessage = {
  role: CanvasPlanChatRole
  content: string
}

export type CanvasReferencePayload = {
  node_id: string
  kind: string
  context: string
}

export type ThemeSnapshotColors = {
  colors?: Partial<Record<string, string>>
}

export type ComponentsCanvasPlanRequest = {
  prompt: string
  messages?: CanvasPlanChatMessage[]
  extended_design_context?: boolean
  /** HTML creator only: optional second Vertex pass to align spacing classes with theme tokens. */
  spacing_enforcement?: boolean
  canvas_references?: CanvasReferencePayload[]
  /** Live hex from Theme editor (palette block on LLM server only). */
  theme_snapshot?: ThemeSnapshotColors
  /** Compressed older chat turns (optional; server may also compress). */
  session_summary?: string
}

/** Keep in sync with `LLM agent/canvas_plan.py`. */
export const MAX_CANVAS_CHAT_MESSAGES = 20
export const MAX_CANVAS_CHAT_MESSAGE_CHARS = 4000
