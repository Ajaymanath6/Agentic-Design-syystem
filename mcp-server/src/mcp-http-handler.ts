import type { IncomingMessage, ServerResponse } from 'node:http'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import path from 'node:path'
import { registerCatalogTools } from './register-catalog-tools.js'

/**
 * Ensure catalog JSON is on disk for serverless (Vercel) and local HTTP smoke tests.
 * Uses `catalog-data/` under `process.cwd()` (mcp-server root locally; `/var/task` on Vercel).
 */
export function ensureServerlessBlueprintsDir(): void {
  if (process.env.AGENTIC_BLUEPRINTS_DIR?.trim()) {
    return
  }
  process.env.AGENTIC_BLUEPRINTS_DIR = path.join(
    process.cwd(),
    'catalog-data',
  )
}

function checkApiKey(
  req: IncomingMessage,
  res: ServerResponse,
): boolean {
  const key = process.env.MCP_API_KEY?.trim()
  if (!key) {
    return true
  }
  const auth = req.headers.authorization
  const headerKey = req.headers['x-mcp-key']
  const bearerOk = auth === `Bearer ${key}`
  const headerOk =
    typeof headerKey === 'string' && headerKey === key
  if (bearerOk || headerOk) {
    return true
  }
  res.statusCode = 401
  res.setHeader('Content-Type', 'application/json')
  res.end(
    JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Unauthorized' },
      id: null,
    }),
  )
  return false
}

/**
 * Stateless Streamable HTTP MCP (one server + transport per request).
 * `parsedBody` should be set for JSON POST bodies (e.g. Vercel's req.body).
 */
export async function runMcpHttpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  parsedBody?: unknown,
): Promise<void> {
  ensureServerlessBlueprintsDir()

  if (!checkApiKey(req, res)) {
    return
  }

  const server = new McpServer(
    { name: 'agentic-catalog', version: '1.0.0' },
    { capabilities: {} },
  )
  registerCatalogTools(server)

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })

  try {
    await server.connect(transport)
    res.on('close', () => {
      void transport.close()
      void server.close()
    })
    await transport.handleRequest(req, res, parsedBody)
  } catch (e) {
    console.error('[agentic-catalog-http]', e)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: e instanceof Error ? e.message : String(e),
          },
          id: null,
        }),
      )
    }
  }
}
