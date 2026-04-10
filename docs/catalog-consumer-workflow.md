# Catalog MCP: consuming blueprints in another codebase

This guide is for developers who **do not** have the Agentic app open as their Cursor workspace but want to use the **catalog MCP** to inspect published components and **reuse** `sourceHtml` (or full blueprint JSON) in their own project.

## What MCP does (and does not do)

- **Does:** Reads `_catalog.json` and blueprint JSON from disk and returns **structured data** and **HTML strings** to Cursor (e.g. `list_catalog`, `get_source_html`, `get_blueprint`).
- **Does not:** Automatically install components into your repo. **Injection** means you (or the **Cursor agent**) **paste or edit files** using that output.

Blueprint markup is stored as `data.sourceHtml` on each blueprint (see [`src/types/catalog.ts`](../src/types/catalog.ts)).

The in-app **Integration** page (`/catalog/integration` in the Agentic catalog UI) offers copy-ready **local** and **hosted (Vercel URL)** `.cursor/mcp.json` snippets. For other repos or **`AGENTIC_BLUEPRINTS_DIR`** (flat blueprints only), use the options in this document. Remote Streamable HTTP details: [`mcp-server/README.md`](../mcp-server/README.md#hosted-mcp-vercel).

## Prerequisites

1. **Node 18+**
2. **Built MCP server:** from a checkout that contains [`mcp-server/`](../mcp-server/), run:

   ```bash
   cd mcp-server
   npm install
   npm run build
   ```

3. **Catalog files on disk**, including at least:
   - `_catalog.json`
   - Per-entry `*.json` blueprints (same layout as Agentic’s [`public/blueprints/`](../public/blueprints/))

## Where the server reads files

The server resolves the blueprints directory in one of two ways:

| Mode | Configuration | Blueprints path |
|------|----------------|-----------------|
| **Default (Agentic layout)** | Set `AGENTIC_ROOT` to the repo root that contains `public/blueprints/`, or omit `AGENTIC_ROOT` when running from `mcp-server/dist` inside Agentic. | `$AGENTIC_ROOT/public/blueprints` |
| **Flat catalog folder** | Set **`AGENTIC_BLUEPRINTS_DIR`** to the directory that **directly** contains `_catalog.json` and the blueprint `*.json` files. | That directory (ignores `public/blueprints` join) |

Use **`AGENTIC_BLUEPRINTS_DIR`** when you publish only a `blueprints/` folder (zip, npm package, or submodule) without mirroring the full Agentic tree.

## Cursor MCP from a *different* repository

When your workspace is **not** Agentic, point MCP at the **built** server script and at your **catalog root** using **absolute paths** (adjust for your machine).

**Option A — Agentic-shaped tree:** `AGENTIC_ROOT` = directory that contains `public/blueprints/`.

```json
{
  "mcpServers": {
    "catalog": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/Agentic/mcp-server/dist/src/index.js"],
      "env": {
        "AGENTIC_ROOT": "/ABSOLUTE/PATH/TO/Agentic"
      }
    }
  }
}
```

**Option B — Flat blueprints folder only:**

```json
{
  "mcpServers": {
    "catalog": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/Agentic/mcp-server/dist/src/index.js"],
      "env": {
        "AGENTIC_BLUEPRINTS_DIR": "/ABSOLUTE/PATH/TO/my-company-catalog/blueprints"
      }
    }
  }
}
```

Place this in **`~/.cursor/mcp.json`** for a global setup, or in **`<your-project>/.cursor/mcp.json`** if your team commits MCP config per repo. Reload the Cursor window after changes.

The **`args`** path must be the real location of **`mcp-server/dist/src/index.js`** (from an Agentic clone or a copied build artifact).

## Prompt recipes (copy-paste)

Use these in **Agent** chat with MCP tools enabled.

1. **Browse components**

   > Use the catalog MCP: call **`list_catalog`** with `kind` set to `component` and summarize the first few entries (id and blueprintPath).

2. **Fetch HTML for one entry**

   > Call **`get_source_html`** for catalog id `PASTE_ID_FROM_LIST_CATALOG`.

3. **Create a React wrapper (sanitized inner HTML)**

   > Using the HTML from **`get_source_html`** for id `…`, add a file `components/AgenticCatalogSnippet.tsx` that sanitizes with **DOMPurify** and renders via **`dangerouslySetInnerHTML`**. Add a short comment about CSP and that only trusted catalog HTML should be passed.

4. **Optional — idiomatic React**

   > Convert this `sourceHtml` into JSX without `dangerouslySetInnerHTML`, using our design system / plain elements.

## Gotchas (read before shipping)

### CSS and styling

`sourceHtml` is authored for Agentic and often uses **Tailwind-style** utility classes (`brandcolor-*`, `font-sans`, `shadow-card`, etc.). In a plain React/Vue app **those classes do nothing** unless you:

- Share or replicate Tailwind / design tokens, or  
- Restyle the markup to match your system.

### Images and absolute paths

Fields like `imageUrl` may be **`/generated/…`** (site-root relative). Consumer apps need a **base URL**, copied static files under `public/`, or a reverse proxy—otherwise images 404.

### Security

If you render catalog HTML with **`innerHTML`** (or `dangerouslySetInnerHTML`), **sanitize** first (e.g. **DOMPurify**) and treat catalog content as **trusted only if your publish pipeline is trusted**. Lock down **CSP** appropriately for your product.

## Publishing / distribution (company-wide)

Pick one or combine:

| Approach | MCP locally | Production app |
|----------|-------------|------------------|
| **Git submodule** | Submodule path → `AGENTIC_BLUEPRINTS_DIR` or parent with `public/blueprints` layout | Same JSON via build copy or HTTP from your host |
| **Internal npm package** | Package extracts to a known folder → `AGENTIC_BLUEPRINTS_DIR` | Import JSON from the package or fetch from CDN |
| **HTTP / CDN** | CI syncs files to disk for developers; MCP still reads **files** | App uses `fetch` at runtime |
| **Clone Agentic** | `AGENTIC_ROOT` = repo root | Not typical for consumer apps |

MCP is a **developer** tool (Cursor); production apps usually consume JSON over **HTTP** or from a **bundled package**, not through MCP.

### Example: flat folder for `AGENTIC_BLUEPRINTS_DIR`

After copying or publishing only blueprint artifacts:

```text
my-company-catalog/blueprints/
  _catalog.json
  canvas-card-….json
  canvas-primary-….json
  …
```

Set `AGENTIC_BLUEPRINTS_DIR` to the absolute path of `my-company-catalog/blueprints` (the directory that **contains** `_catalog.json`).

### Example: Agentic-shaped clone (default)

```text
Agentic/
  public/
    blueprints/
      _catalog.json
      …
  mcp-server/
    dist/
      index.js
```

Set `AGENTIC_ROOT` to the `Agentic` directory (or omit when Cursor runs MCP from inside this repo with default `.cursor/mcp.json`).

## Verification checklist

Use this to confirm an external developer setup (no separate sample repo is required—you can use any small test project opened as the Cursor workspace):

1. `mcp-server` is built (`dist/src/index.js` exists).
2. Catalog directory contains `_catalog.json` and blueprint JSON files.
3. `AGENTIC_ROOT` or `AGENTIC_BLUEPRINTS_DIR` is set correctly (server stderr on start prints resolved paths—see [`mcp-server/README.md`](../mcp-server/README.md)).
4. **Quick CLI check (optional):** from Agentic repo root, with a flat catalog copy at `/tmp/my-blueprints`:

   ```bash
   AGENTIC_BLUEPRINTS_DIR=/tmp/my-blueprints node mcp-server/dist/src/index.js
   ```

   Confirm stderr shows `blueprints=/tmp/my-blueprints (AGENTIC_BLUEPRINTS_DIR)` then Ctrl+C.

5. Cursor **Tools & MCP** shows **`catalog`** connected; **`list_catalog`** returns rows.
6. **`get_source_html`** returns a non-empty string for a component that has `sourceHtml`.
7. Team understands **CSS**, **assets**, and **sanitization** constraints above before using HTML in production UI.

## See also

- [`mcp-server/README.md`](../mcp-server/README.md) — build, env vars, troubleshooting  
- [`public/blueprints/_catalog.json`](../public/blueprints/_catalog.json) — catalog index  
