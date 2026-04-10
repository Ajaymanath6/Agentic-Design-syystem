# Agentic catalog MCP server

Read-only MCP server for **Cursor** (and other MCP clients). Exposes tools that read the same catalog the Vite app uses: [`public/blueprints/_catalog.json`](../public/blueprints/_catalog.json) and per-component blueprint JSON files.

**Consuming catalog HTML in another repo?** See **[`docs/catalog-consumer-workflow.md`](../docs/catalog-consumer-workflow.md)** (MCP from a foreign workspace, `AGENTIC_BLUEPRINTS_DIR`, prompts, CSS/assets/security, publishing options).

**Hosted (remote) MCP on Vercel:** See [Hosted MCP (Vercel)](#hosted-mcp-vercel) below.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `AGENTIC_ROOT` | Root of an Agentic-style tree; blueprints default to `AGENTIC_ROOT/public/blueprints`. If unset, inferred by walking up from the running script until `public/blueprints/_catalog.json` exists. |
| `AGENTIC_BLUEPRINTS_DIR` | **Optional.** If set, the server reads `_catalog.json` and blueprint `*.json` files **directly** from this directory (flat catalog package). Overrides the `public/blueprints` path. Used on Vercel for bundled `catalog-data/`. |
| `MCP_API_KEY` | **Optional (HTTP only).** If set, require `Authorization: Bearer <key>` or header `x-mcp-key: <key>`. |
| `VERCEL` | Set by Vercel at runtime; used with `process.cwd()` for default `catalog-data/` layout. |

## Prerequisites

- Node **18+**
- For **stdio** MCP: built catalog files under `public/blueprints/` in the Agentic repo.
- For **Vercel**: `npm run vercel-build` copies `../public/blueprints` into `catalog-data/` (see `scripts/copy-blueprints.mjs`).

## Build

**stdio (local Cursor):** compile so `dist/src/index.js` exists.

```bash
cd mcp-server
npm install
npm run build
```

Entry point: `dist/src/index.js` (ESM).

## Hosted MCP (Vercel)

Deploy **`mcp-server/`** as a **separate Vercel project** (same Git repo, Root Directory = `mcp-server`). This exposes **Streamable HTTP** MCP at:

- **`https://<deployment>/api/mcp`**
- **`https://<deployment>/mcp`** (rewrite to `/api/mcp` via [`vercel.json`](vercel.json))

### Build on Vercel

Default [`vercel.json`](vercel.json) `buildCommand`: `npm run vercel-build` (= `tsc` + copy blueprints into `catalog-data/`).

If the build runs **without** the parent repo’s `public/blueprints`, the copy script writes an **empty** `_catalog.json` so the deploy still succeeds (replace by ensuring the full monorepo is cloned or sync files in CI).

### Environment variables (Vercel dashboard)

| Variable | Required | Purpose |
|----------|----------|---------|
| `MCP_API_KEY` | No | If set, clients must send the key (recommended for public URLs). |

`AGENTIC_BLUEPRINTS_DIR` is set automatically to `catalog-data/` under the serverless cwd when unset.

### Cursor remote configuration (verify against [Cursor MCP docs](https://cursor.com/docs/context/mcp))

Remote servers use a **`url`** (not `command`/`node`). Example:

```json
{
  "mcpServers": {
    "agentic-catalog": {
      "url": "https://YOUR_PROJECT.vercel.app/mcp"
    }
  }
}
```

If you set **`MCP_API_KEY`** on Vercel:

```json
{
  "mcpServers": {
    "agentic-catalog": {
      "url": "https://YOUR_PROJECT.vercel.app/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SECRET"
      }
    }
  }
}
```

**Phase 0 / constraints**

- Confirm the exact **`mcp.json`** shape for your Cursor version (some builds use different keys for headers or server type).
- **Vercel serverless timeouts** and cold starts may affect long MCP sessions; if tools fail under load, run the same handler on **Fly.io**, **Railway**, or **Render** with a long-lived Node process.

### Local HTTP smoke test

```bash
cd mcp-server
npm run build
npm run vercel:prepare
npm run http:local
```

Example POST (requires **Accept** headers for Streamable HTTP):

```bash
curl -sS -X POST 'http://127.0.0.1:3456/mcp' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl","version":"0"}},"id":1}'
```

## Cursor configuration (stdio)

Cursor registers MCP servers via a top-level **`mcpServers`** object (not a `"tools"` array).

### Project quick start (recommended)

This repo includes **[`.cursor/mcp.json`](../.cursor/mcp.json)** at the workspace root.

```json
{
  "mcpServers": {
    "catalog": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-server/dist/src/index.js"],
      "env": {
        "AGENTIC_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

### User-global `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "agentic-catalog": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/Agentic/mcp-server/dist/src/index.js"],
      "env": {
        "AGENTIC_ROOT": "/ABSOLUTE/PATH/TO/Agentic"
      }
    }
  }
}
```

**Flat catalog only:** set **`AGENTIC_BLUEPRINTS_DIR`** to the folder that contains `_catalog.json` and blueprint files.

### Common mistakes

- **Wrong JSON shape:** Cursor expects `mcpServers`, not a top-level `"tools": [...]` list.
- **Missing build:** If `mcp-server/dist/src/index.js` does not exist, stdio MCP will fail to start.

### Verifying in Cursor

1. **Settings → Tools & MCP** — confirm the server connects and tools **`list_catalog`**, **`get_blueprint`**, **`get_source_html`**, **`search_catalog`** appear.
2. Try **`list_catalog`** from chat.

## Tools

| Tool | Purpose |
|------|--------|
| `list_catalog` | Rows from `_catalog.json` (`id`, `kind`, `blueprintPath`, …). Optional filter `kind`: `component` \| `layout`. |
| `search_catalog` | Substring search on `id`, `importId`, `blueprintPath`. |
| `get_blueprint` | Full blueprint JSON. **Exactly one** of `id` or `blueprintFile` (basename only). |
| `get_source_html` | Only `data.sourceHtml`. Same arguments as `get_blueprint`. |

**stdio:** Do not log to **stdout**; use **stderr** only.

## Troubleshooting

- **`Catalog index not found`**: Wrong paths or missing `_catalog.json` in the resolved blueprints directory.
- **`No catalog entry for id`**: Run `list_catalog` and copy an `id` exactly.
- **`blueprintFile must be a plain filename`**: Only `foo.json`, not full paths.

## Smoke test from repo root (stdio)

```bash
npm run mcp:catalog
```

Interrupt with Ctrl+C. Prefer **Tools & MCP** in Cursor for a full check.

## Verification checklist (hosted)

1. Deploy the `mcp-server` Vercel project; open `https://…/mcp` (rewrite) in docs only—real traffic is POST from Cursor.
2. In Cursor, add the **remote** `mcp.json` entry with your deployment URL.
3. Run **`list_catalog`** from chat.
4. If requests fail, check Vercel function logs and timeout settings.
