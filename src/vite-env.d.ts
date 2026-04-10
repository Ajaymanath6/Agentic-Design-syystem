/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HELPER_BASE_URL?: string
  readonly VITE_AGENT_BASE_URL?: string
  readonly VITE_LAYOUT_LLM_BASE_URL?: string
  /** Optional: show this URL in Integration “hosted MCP” copy snippet (Vercel deployment). */
  readonly VITE_MCP_REMOTE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
