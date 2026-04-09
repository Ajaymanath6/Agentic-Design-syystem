import { LAYOUT_LLM_BASE_URL } from '../config/env'
import type { ComponentsCanvasPlanRequest } from '../types/components-canvas-plan-request'
import type { CanvasPlanV1 } from '../types/canvas-plan'
import { isCanvasPlanV1 } from '../types/canvas-plan'

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

/**
 * Structured components-canvas plan (JSON). Same proxy base as layout LLM.
 */
export async function callComponentsCanvasPlan(
  body: ComponentsCanvasPlanRequest,
): Promise<CanvasPlanV1> {
  const payload: Record<string, unknown> = {
    prompt: body.prompt.trim(),
    extended_design_context: Boolean(body.extended_design_context),
  }
  if (body.messages != null && body.messages.length > 0) {
    payload.messages = body.messages
  }
  const res = await fetch(`${LAYOUT_LLM_BASE_URL}/canvas/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = (await res.json().catch(() => ({}))) as {
    plan?: unknown
    detail?: string | Array<{ msg?: string }>
    error?: string
  }
  if (!res.ok) {
    const extra = parseDetail(data)
    throw new Error(
      extra ? `Request failed (${res.status}): ${extra}` : `Request failed (${res.status})`,
    )
  }
  if (!isCanvasPlanV1(data.plan)) {
    throw new Error('Invalid components canvas plan response')
  }
  return data.plan
}
