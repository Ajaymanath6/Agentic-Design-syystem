import { LAYOUT_LLM_BASE_URL } from '../config/env'
import type { ComponentsCanvasPlanRequest } from '../types/components-canvas-plan-request'

export type ComponentsCanvasHtmlResponse = {
  html: string
  title: string
}

function parseDetail(data: {
  detail?: string | Array<{ msg?: string }>
  error?: string
}): string {
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.detail) && data.detail[0]?.msg) {
    return String(data.detail[0].msg)
  }
  if (data.error) return data.error
  return ''
}

function isHtmlResponse(v: unknown): v is ComponentsCanvasHtmlResponse {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return typeof o.html === 'string' && o.html.length > 0 && typeof o.title === 'string'
}

/**
 * HTML creator path: Vertex returns a fragment; client sanitizes before render/storage.
 */
export async function callComponentsCanvasGenerateHtml(
  body: ComponentsCanvasPlanRequest,
): Promise<ComponentsCanvasHtmlResponse> {
  const payload: Record<string, unknown> = {
    prompt: body.prompt.trim(),
    extended_design_context: Boolean(body.extended_design_context),
  }
  if (body.messages != null && body.messages.length > 0) {
    payload.messages = body.messages
  }
  if (body.canvas_references != null && body.canvas_references.length > 0) {
    payload.canvas_references = body.canvas_references
  }
  const res = await fetch(`${LAYOUT_LLM_BASE_URL}/canvas/generate-html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = (await res.json().catch(() => ({}))) as {
    html?: unknown
    title?: unknown
    detail?: string | Array<{ msg?: string }>
    error?: string
  }
  if (!res.ok) {
    const extra = parseDetail(data)
    throw new Error(
      extra ? `Request failed (${res.status}): ${extra}` : `Request failed (${res.status})`,
    )
  }
  if (!isHtmlResponse(data)) {
    throw new Error('Invalid components canvas HTML response')
  }
  return { html: data.html, title: data.title }
}
