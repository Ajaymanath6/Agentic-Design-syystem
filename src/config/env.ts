export const HELPER_BASE_URL =
  import.meta.env.VITE_HELPER_BASE_URL ?? 'http://127.0.0.1:4301'

export const AGENT_BASE_URL = import.meta.env.VITE_AGENT_BASE_URL ?? ''

/** When publish-helper has THEME_SYNC_SECRET set, send the same value from .env (never commit). */
export const THEME_SYNC_TOKEN =
  (import.meta.env.VITE_THEME_SYNC_TOKEN as string | undefined) ?? ''

/**
 * Vertex layout LLM (FastAPI). Dev: same-origin Vite proxy → port 4302.
 * Production: set VITE_LAYOUT_LLM_BASE_URL to your gateway (never embed AWS/GCP secrets in the client).
 */
export const LAYOUT_LLM_BASE_URL =
  import.meta.env.VITE_LAYOUT_LLM_BASE_URL ?? '/api/layout-llm'
