/**
 * Cursor MCP JSON shape for `.cursor/mcp.json` (catalog server).
 * Kept in sync with committed `.cursor/mcp.json` at repo root.
 */
export type CatalogMcpServerEntry = {
  command: string
  args: string[]
  env?: Record<string, string>
}

export type CatalogMcpConfigFile = {
  mcpServers: Record<string, CatalogMcpServerEntry>
}

/** Replace with your Agentic clone root (used in full-clone template). */
export const PLACEHOLDER_AGENTIC_ROOT = '/ABSOLUTE/PATH/TO/Agentic'

/**
 * Replace with absolute path to built `index.js` only (e.g. copy `mcp-server/dist/src/index.js`
 * from a release or another machine).
 */
export const PLACEHOLDER_MCP_ENTRY_SCRIPT =
  '/ABSOLUTE/PATH/TO/agentic-mcp-dist/index.js'

/**
 * Replace with folder that directly contains `_catalog.json` and blueprint `*.json`.
 */
export const PLACEHOLDER_CATALOG_BLUEPRINTS_DIR =
  '/ABSOLUTE/PATH/TO/catalog-blueprints'

/** Use when the Cursor workspace root is the Agentic repo (same as `.cursor/mcp.json`). */
export function getMcpConfigForAgenticWorkspace(): CatalogMcpConfigFile {
  return {
    mcpServers: {
      catalog: {
        command: 'node',
        args: ['${workspaceFolder}/mcp-server/dist/src/index.js'],
        env: { AGENTIC_ROOT: '${workspaceFolder}' },
      },
    },
  }
}

/** Use for another repo: replace the placeholder with your Agentic clone path. */
export function getMcpConfigTemplateWithPlaceholders(): CatalogMcpConfigFile {
  return {
    mcpServers: {
      catalog: {
        command: 'node',
        args: [`${PLACEHOLDER_AGENTIC_ROOT}/mcp-server/dist/src/index.js`],
        env: { AGENTIC_ROOT: PLACEHOLDER_AGENTIC_ROOT },
      },
    },
  }
}

/**
 * Catalog JSON + prebuilt MCP entry only — no full Agentic `public/` tree.
 * Set `AGENTIC_BLUEPRINTS_DIR` to the folder containing `_catalog.json` and blueprints.
 */
export function getMcpConfigTemplateCatalogOnly(): CatalogMcpConfigFile {
  return {
    mcpServers: {
      catalog: {
        command: 'node',
        args: [PLACEHOLDER_MCP_ENTRY_SCRIPT],
        env: { AGENTIC_BLUEPRINTS_DIR: PLACEHOLDER_CATALOG_BLUEPRINTS_DIR },
      },
    },
  }
}

export function formatMcpConfigJson(config: CatalogMcpConfigFile): string {
  return `${JSON.stringify(config, null, 2)}\n`
}

/** Placeholder URL; `vercel.json` rewrites `/mcp` → `/api/mcp`. */
export const PLACEHOLDER_VERCEL_MCP_URL =
  'https://YOUR_DEPLOYMENT.vercel.app/mcp'

/** Cursor remote MCP (Streamable HTTP). Confirm field names in current Cursor docs. */
export type HostedMcpServerEntry = {
  url: string
  headers?: Record<string, string>
}

export type HostedMcpConfigFile = {
  mcpServers: Record<string, HostedMcpServerEntry>
}

export function getHostedMcpConfig(
  remoteUrl: string = PLACEHOLDER_VERCEL_MCP_URL,
  options?: { includeAuthHeaderPlaceholder?: boolean },
): HostedMcpConfigFile {
  const entry: HostedMcpServerEntry = { url: remoteUrl }
  if (options?.includeAuthHeaderPlaceholder) {
    entry.headers = {
      Authorization: 'Bearer YOUR_MCP_API_KEY',
    }
  }
  return {
    mcpServers: {
      'agentic-catalog': entry,
    },
  }
}

export function formatHostedMcpConfigJson(config: HostedMcpConfigFile): string {
  return `${JSON.stringify(config, null, 2)}\n`
}
