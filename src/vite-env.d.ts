/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HELPER_BASE_URL?: string
  readonly VITE_AGENT_BASE_URL?: string
  readonly VITE_LAYOUT_LLM_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
