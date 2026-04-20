import { LAYOUT_LLM_BASE_URL } from '../config/env'
import type { LayoutHtmlGenerateRequest } from '../types/layout-html-request'
import type { LayoutPlanV1 } from '../types/layout-plan'
import { isLayoutPlanV1 } from '../types/layout-plan'

/**
 * Calls the local Vertex proxy (FastAPI). No secrets in the browser — only prompt text.
 */
export async function callLayoutGenerate(
  prompt: string,
  systemContext?: string,
): Promise<string> {
  const res = await fetch(`${LAYOUT_LLM_BASE_URL}/layout/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      systemContext: systemContext?.trim() || undefined,
    }),
  })
  const data = (await res.json().catch(() => ({}))) as {
    text?: string
    detail?: string | Array<{ msg?: string }>
    error?: string
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    if (typeof data.detail === 'string') {
      msg = data.detail
    } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
      msg = String(data.detail[0].msg)
    } else if (data.error) {
      msg = data.error
    }
    throw new Error(msg)
  }
  const text = data.text
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Empty response from layout LLM')
  }
  return text
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

/**
 * Structured layout plan (JSON only). Server validates catalog refs and theme keys.
 */
export async function callLayoutPlan(
  prompt: string,
  catalogAllowlist: string[],
): Promise<LayoutPlanV1> {
  const res = await fetch(`${LAYOUT_LLM_BASE_URL}/layout/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      catalogAllowlist,
    }),
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
  if (!isLayoutPlanV1(data.plan)) {
    throw new Error('Invalid layout plan response')
  }
  return data.plan
}

export type LayoutGenerateHtmlResult = {
  html: string
  title: string
}

/**
 * Generative HTML for layout workspace (sanitized again in the client before render).
 */
export async function callLayoutGenerateHtml(
  body: LayoutHtmlGenerateRequest,
): Promise<LayoutGenerateHtmlResult> {
  const res = await fetch(`${LAYOUT_LLM_BASE_URL}/layout/generate-html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: body.prompt,
      catalogAllowlist: body.catalogAllowlist,
      catalogReferenceBlocks: body.catalogReferenceBlocks?.length
        ? body.catalogReferenceBlocks
        : undefined,
      extended_design_context: Boolean(body.extended_design_context),
      spacing_enforcement: Boolean(body.spacing_enforcement),
    }),
  })
  const data = (await res.json().catch(() => ({}))) as {
    html?: string
    title?: string
    detail?: string | Array<{ msg?: string }>
    error?: string
  }
  if (!res.ok) {
    const extra = parseDetail(data)
    throw new Error(
      extra ? `Request failed (${res.status}): ${extra}` : `Request failed (${res.status})`,
    )
  }
  const html = data.html
  const title = data.title
  if (typeof html !== 'string' || !html.trim()) {
    throw new Error('Invalid layout HTML response')
  }
  if (typeof title !== 'string' || !title.trim()) {
    throw new Error('Invalid layout HTML title')
  }
  return { html, title }
}
