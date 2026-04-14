import { AGENT_BASE_URL, HELPER_BASE_URL, THEME_SYNC_TOKEN } from '../config/env'
import type { BlueprintDocument } from '../types/catalog'

function helperUnreachableMessage(cause: string): string {
  return (
    `Cannot reach the publish helper at ${HELPER_BASE_URL}. ` +
    `Use npm run dev (starts Vite + helper together), or in a second terminal run npm run dev:helper. ` +
    `If you use npm run dev:vite, start the helper separately. ${cause}`
  )
}

async function helperFetch(
  path: string,
  init: RequestInit,
): Promise<Response> {
  const url = `${HELPER_BASE_URL.replace(/\/$/, '')}${path}`
  try {
    return await fetch(url, init)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(helperUnreachableMessage(msg))
  }
}

export type BlueprintPreviewResponse = {
  componentId: string
  importId: string
  thumbnailPath: string
  blueprint: BlueprintDocument
}

export type PublishResponse = BlueprintPreviewResponse & {
  catalogEntry: {
    id: string
    publishedAt: string
    hasBlueprint: boolean
    apiEndpoint: string | null
    importId: string
    thumbnailPath: string
    blueprintPath: string
    kind?: 'component' | 'layout'
  }
}

export async function postBlueprintPreview(body: {
  componentId: string
  label: string
  structure?: unknown
  description?: string
  sealed?: boolean
  sourceHtml?: string
}): Promise<BlueprintPreviewResponse> {
  const res = await helperFetch('/api/blueprint-preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Preview failed: ${res.status}`)
  }
  return res.json() as Promise<BlueprintPreviewResponse>
}

export async function postPublish(body: {
  componentId: string
  label: string
  screenshot?: string
  structure?: unknown
  description?: string
  sealed?: boolean
  sourceHtml?: string
  kind?: 'component' | 'layout'
}): Promise<PublishResponse> {
  const res = await helperFetch('/api/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Publish failed: ${res.status}`)
  }
  const data = (await res.json()) as PublishResponse

  if (AGENT_BASE_URL) {
    void fetch(`${AGENT_BASE_URL.replace(/\/$/, '')}/blueprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.blueprint),
    }).catch(() => {
      /* fire-and-forget */
    })
  }

  return data
}

export async function postDeleteComponent(componentId: string): Promise<void> {
  const res = await helperFetch('/api/delete-component', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ componentId }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Delete failed: ${res.status}`)
  }
}

export type PruneCanvasCatalogResponse = {
  pruned: number
  removedIds: string[]
}

/** Remove published canvas-card-* / canvas-primary-* / canvas-secondary-* / canvas-neutral-* / canvas-confirm-password-* / canvas-text-field-* / canvas-product-sidebar-* / canvas-html-* rows not listed in keepIds. */
export type ThemeSyncResponse = {
  ok: boolean
  written: string[]
}

/** Write theme artifacts into repo files (requires local publish-helper + npm run dev). */
export async function postThemeSyncToProject(body: {
  colors: Record<string, string>
  /** When set, all shadow tokens must be present (validated server-side). */
  shadows?: Record<string, string>
  typography?: Record<string, string>
}): Promise<ThemeSyncResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (THEME_SYNC_TOKEN.trim() !== '') {
    headers['x-theme-sync-token'] = THEME_SYNC_TOKEN.trim()
  }
  const res = await helperFetch('/api/theme/sync', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    let msg = text
    try {
      const j = JSON.parse(text) as { error?: string }
      if (typeof j.error === 'string' && j.error) msg = j.error
    } catch {
      /* keep raw body */
    }
    throw new Error(msg || `Theme sync failed: ${res.status}`)
  }
  return res.json() as Promise<ThemeSyncResponse>
}

export async function postPruneCanvasCatalog(
  keepIds: string[],
): Promise<PruneCanvasCatalogResponse> {
  const res = await helperFetch('/api/prune-canvas-catalog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keepIds }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Prune failed: ${res.status}`)
  }
  return res.json() as Promise<PruneCanvasCatalogResponse>
}
