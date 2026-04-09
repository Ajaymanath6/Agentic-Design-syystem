#!/usr/bin/env node
/**
 * Prune components-canvas rows (id prefix canvas-card-) from public/blueprints/_catalog.json
 * and delete their blueprint + thumbnail files under public/ and blueprints/.
 *
 * Usage:
 *   node scripts/prune-canvas-catalog.mjs --uuid <node-uuid> [--uuid <uuid> ...]
 *   node scripts/prune-canvas-catalog.mjs --secondary-uuid <node-uuid> (secondary button blocks)
 *   node scripts/prune-canvas-catalog.mjs --neutral-uuid <node-uuid> (neutral button blocks)
 *   node scripts/prune-canvas-catalog.mjs --board-json path/to/agentic-components-canvas-nodes-v1.json
 *   node scripts/prune-canvas-catalog.mjs --keep-latest-canvas 1
 *   node scripts/prune-canvas-catalog.mjs --dry-run --uuid ...
 *
 * Non–canvas-card catalog entries are never removed.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const publicBlueprints = path.join(projectRoot, 'public', 'blueprints')
const publicGenerated = path.join(projectRoot, 'public', 'generated')
const repoBlueprints = path.join(projectRoot, 'blueprints')
const catalogPath = path.join(publicBlueprints, '_catalog.json')

function toKebabComponentId(raw) {
  if (!raw || typeof raw !== 'string') return 'unnamed-component'
  let s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (!s) s = 'unnamed-component'
  return s
}

function canvasCardCatalogId(nodeId) {
  return toKebabComponentId(`canvas-card-${nodeId}`)
}

function canvasPrimaryButtonCatalogId(nodeId) {
  return toKebabComponentId(`canvas-primary-${nodeId}`)
}

function canvasSecondaryButtonCatalogId(nodeId) {
  return toKebabComponentId(`canvas-secondary-${nodeId}`)
}

function canvasNeutralButtonCatalogId(nodeId) {
  return toKebabComponentId(`canvas-neutral-${nodeId}`)
}

function canvasConfirmPasswordInputCatalogId(nodeId) {
  return toKebabComponentId(`canvas-confirm-password-${nodeId}`)
}

function canvasTextInputFieldCatalogId(nodeId) {
  return toKebabComponentId(`canvas-text-field-${nodeId}`)
}

function canvasProductSidebarCatalogId(nodeId) {
  return toKebabComponentId(`canvas-product-sidebar-${nodeId}`)
}

function canvasHtmlSnippetCatalogId(nodeId) {
  return toKebabComponentId(`canvas-html-${nodeId}`)
}

function catalogIdFromBoardRow(row) {
  if (row && row.kind === 'primaryButton' && typeof row.id === 'string') {
    return canvasPrimaryButtonCatalogId(row.id)
  }
  if (row && row.kind === 'secondaryButton' && typeof row.id === 'string') {
    return canvasSecondaryButtonCatalogId(row.id)
  }
  if (row && row.kind === 'neutralButton' && typeof row.id === 'string') {
    return canvasNeutralButtonCatalogId(row.id)
  }
  if (row && row.kind === 'confirmPasswordInput' && typeof row.id === 'string') {
    return canvasConfirmPasswordInputCatalogId(row.id)
  }
  if (row && row.kind === 'textInputField' && typeof row.id === 'string') {
    return canvasTextInputFieldCatalogId(row.id)
  }
  if (row && row.kind === 'productSidebar' && typeof row.id === 'string') {
    return canvasProductSidebarCatalogId(row.id)
  }
  if (row && row.kind === 'htmlSnippet' && typeof row.id === 'string') {
    return canvasHtmlSnippetCatalogId(row.id)
  }
  if (row && typeof row.id === 'string') {
    return canvasCardCatalogId(row.id)
  }
  return null
}

function readCatalog() {
  try {
    const raw = fs.readFileSync(catalogPath, 'utf8')
    const data = JSON.parse(raw)
    if (!data.components || !Array.isArray(data.components)) {
      return { version: '1.0', lastUpdated: new Date().toISOString(), components: [] }
    }
    return data
  } catch {
    return { version: '1.0', lastUpdated: new Date().toISOString(), components: [] }
  }
}

function writeCatalog(catalog) {
  catalog.lastUpdated = new Date().toISOString()
  catalog.components.sort((a, b) => a.id.localeCompare(b.id))
  fs.mkdirSync(publicBlueprints, { recursive: true })
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8')
}

function removeComponentArtifacts(componentId) {
  for (const base of [publicBlueprints, repoBlueprints]) {
    const p = path.join(base, `${componentId}.json`)
    try {
      fs.unlinkSync(p)
    } catch {
      /* ignore */
    }
  }
  for (const ext of ['png', 'svg']) {
    const p = path.join(publicGenerated, `${componentId}-thumbnail.${ext}`)
    try {
      fs.unlinkSync(p)
    } catch {
      /* ignore */
    }
  }
}

function isComponentsCanvasCatalogId(id) {
  return (
    typeof id === 'string' &&
    (id.startsWith('canvas-card-') ||
      id.startsWith('canvas-primary-') ||
      id.startsWith('canvas-secondary-') ||
      id.startsWith('canvas-neutral-') ||
      id.startsWith('canvas-confirm-password-') ||
      id.startsWith('canvas-text-field-') ||
      id.startsWith('canvas-product-sidebar-') ||
      id.startsWith('canvas-html-'))
  )
}

function parseArgs(argv) {
  const uuids = []
  const primaryUuids = []
  const secondaryUuids = []
  const neutralUuids = []
  let boardJson = null
  let keepLatestCanvas = 0
  let dryRun = false
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--uuid') {
      uuids.push(argv[++i])
    } else if (a === '--primary-uuid') {
      primaryUuids.push(argv[++i])
    } else if (a === '--secondary-uuid') {
      secondaryUuids.push(argv[++i])
    } else if (a === '--neutral-uuid') {
      neutralUuids.push(argv[++i])
    } else if (a === '--board-json') {
      boardJson = argv[++i]
    } else if (a === '--keep-latest-canvas') {
      keepLatestCanvas = Math.max(0, parseInt(argv[++i], 10) || 0)
    } else if (a === '--dry-run') {
      dryRun = true
    } else if (a === '--help' || a === '-h') {
      console.log(`See header in scripts/prune-canvas-catalog.mjs`)
      process.exit(0)
    }
  }
  return {
    uuids,
    primaryUuids,
    secondaryUuids,
    neutralUuids,
    boardJson,
    keepLatestCanvas,
    dryRun,
  }
}

function collectKeepIds({
  uuids,
  primaryUuids,
  secondaryUuids,
  neutralUuids,
  boardJson,
  keepLatestCanvas,
}) {
  const keep = new Set()
  for (const u of uuids) {
    if (u) keep.add(canvasCardCatalogId(u))
  }
  for (const u of primaryUuids) {
    if (u) keep.add(canvasPrimaryButtonCatalogId(u))
  }
  for (const u of secondaryUuids) {
    if (u) keep.add(canvasSecondaryButtonCatalogId(u))
  }
  for (const u of neutralUuids) {
    if (u) keep.add(canvasNeutralButtonCatalogId(u))
  }
  if (boardJson) {
    const raw = fs.readFileSync(path.resolve(boardJson), 'utf8')
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) {
      throw new Error('--board-json must be a JSON array of { id, ... } nodes')
    }
    for (const row of data) {
      const cid = catalogIdFromBoardRow(row)
      if (cid) keep.add(cid)
    }
  }
  if (keepLatestCanvas > 0) {
    const catalog = readCatalog()
    const canvasRows = catalog.components.filter((c) =>
      isComponentsCanvasCatalogId(c.id),
    )
    canvasRows.sort((a, b) => {
      const ta = new Date(a.publishedAt || 0).getTime()
      const tb = new Date(b.publishedAt || 0).getTime()
      return tb - ta
    })
    for (const row of canvasRows.slice(0, keepLatestCanvas)) {
      keep.add(row.id)
    }
  }
  return keep
}

function main() {
  const opts = parseArgs(process.argv)
  const keep = collectKeepIds(opts)
  if (keep.size === 0) {
    console.error(
      'Nothing to keep: pass --uuid / --primary-uuid / --secondary-uuid / --neutral-uuid, --board-json, or --keep-latest-canvas N',
    )
    process.exit(1)
  }

  const catalog = readCatalog()
  const removedIds = []
  const next = []
  for (const c of catalog.components) {
    if (!isComponentsCanvasCatalogId(c.id)) {
      next.push(c)
      continue
    }
    if (keep.has(c.id)) {
      next.push(c)
      continue
    }
    removedIds.push(c.id)
  }

  console.log(
    opts.dryRun ? '[dry-run] Would remove:' : 'Removing:',
    removedIds.length ? removedIds.join(', ') : '(none)',
  )
  console.log('Keeping canvas-card ids:', [...keep].sort().join(', '))

  if (opts.dryRun) return

  catalog.components = next
  writeCatalog(catalog)
  for (const id of removedIds) {
    removeComponentArtifacts(id)
  }
  console.log('Done. Updated', catalogPath)
}

main()
