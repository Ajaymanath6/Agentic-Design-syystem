/**
 * Local publish helper — port 4301.
 * Writes blueprints + thumbnails under public/ and repo blueprints/.
 */
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const publicRoot = path.join(projectRoot, 'public')
const publicBlueprints = path.join(publicRoot, 'blueprints')
const publicGenerated = path.join(publicRoot, 'generated')
const repoBlueprints = path.join(projectRoot, 'blueprints')
const catalogIndexPath = path.join(publicBlueprints, '_catalog.json')
const catalogSchemaSrc = path.join(projectRoot, 'catalog-schema.json')

const PORT = Number(process.env.PUBLISH_HELPER_PORT || 4301)

function ensureDirs() {
  for (const d of [publicBlueprints, publicGenerated, repoBlueprints]) {
    fs.mkdirSync(d, { recursive: true })
  }
}

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

function toImportId(kebab) {
  const parts = kebab.split('-').filter(Boolean)
  const pascal = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
  return `${pascal || 'Unnamed'}Component`
}

function readCatalog() {
  try {
    const raw = fs.readFileSync(catalogIndexPath, 'utf8')
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
  fs.writeFileSync(catalogIndexPath, JSON.stringify(catalog, null, 2), 'utf8')
}

function copyCatalogSchemaIfPresent() {
  try {
    if (fs.existsSync(catalogSchemaSrc)) {
      fs.copyFileSync(
        catalogSchemaSrc,
        path.join(publicBlueprints, 'catalog-schema.json'),
      )
    }
  } catch {
    /* ignore */
  }
}

function parseDataUrlPng(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null
  const m = dataUrl.match(/^data:image\/png;base64,(.+)$/i)
  if (!m) return null
  try {
    return Buffer.from(m[1], 'base64')
  } catch {
    return null
  }
}

function writePlaceholderSvg(componentId, label, outPath) {
  const safe = String(label || componentId).replace(/</g, '&lt;')
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
  <rect width="100%" height="100%" fill="#F5F5F5"/>
  <rect x="8" y="8" width="304" height="184" fill="#FFFFFF" stroke="#DDDDDD" stroke-width="2" rx="8"/>
  <text x="160" y="100" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#001A31">${safe}</text>
</svg>`
  fs.writeFileSync(outPath, svg, 'utf8')
}

function buildBlueprint({
  componentId,
  label,
  importId,
  structure,
  description,
  sealed,
  sourceHtml,
  thumbnailPublicPath,
}) {
  const rootComponent =
    structure && typeof structure === 'object' && structure.component
      ? structure.component
      : 'div'
  const rootData =
    structure && typeof structure === 'object' && structure.data
      ? { ...structure.data }
      : {}
  const children =
    structure && typeof structure === 'object' && Array.isArray(structure.children)
      ? structure.children
      : structure && typeof structure === 'object' && structure.children === undefined
        ? []
        : undefined

  return {
    schemaVersion: '1.0',
    id: componentId,
    component: rootComponent,
    importId,
    data: {
      ...rootData,
      imageUrl: thumbnailPublicPath,
      imageAlt: label,
      ...(description != null ? { description } : {}),
      ...(sealed != null ? { sealed } : {}),
      ...(sourceHtml != null ? { sourceHtml } : {}),
    },
    ...(children !== undefined ? { children } : {}),
  }
}

function mergeCatalogEntry(catalog, entry) {
  const idx = catalog.components.findIndex((c) => c.id === entry.id)
  if (idx >= 0) catalog.components[idx] = entry
  else catalog.components.push(entry)
}

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '25mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/blueprint-preview', (req, res) => {
  try {
    const body = req.body || {}
    const componentId = toKebabComponentId(body.componentId || body.label || 'preview')
    const label = String(body.label || componentId)
    const importId = toImportId(componentId)
    const thumbnailPath = `/generated/${componentId}-thumbnail.png`
    const structure = body.structure

    const blueprint = buildBlueprint({
      componentId,
      label,
      importId,
      structure,
      description: body.description,
      sealed: body.sealed,
      sourceHtml: body.sourceHtml,
      thumbnailPublicPath: thumbnailPath,
    })

    res.json({
      componentId,
      importId,
      thumbnailPath,
      blueprint,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: String(e?.message || e) })
  }
})

app.post('/api/publish', (req, res) => {
  try {
    ensureDirs()
    const body = req.body || {}
    const componentId = toKebabComponentId(body.componentId || body.label)
    const label = String(body.label || componentId)
    const importId = toImportId(componentId)
    const thumbnailFilename = `${componentId}-thumbnail.png`
    const thumbnailPublicPath = `/generated/${thumbnailFilename}`
    const absThumb = path.join(publicGenerated, thumbnailFilename)
    const png = parseDataUrlPng(body.screenshot)
    if (png && png.length > 0) {
      fs.writeFileSync(absThumb, png)
    } else {
      const svgPath = path.join(
        publicGenerated,
        `${componentId}-thumbnail.svg`,
      )
      writePlaceholderSvg(componentId, label, svgPath)
    }

    const blueprint = buildBlueprint({
      componentId,
      label,
      importId,
      structure: body.structure,
      description: body.description,
      sealed: body.sealed,
      sourceHtml: body.sourceHtml,
      thumbnailPublicPath: png && png.length > 0 ? thumbnailPublicPath : `/generated/${componentId}-thumbnail.svg`,
    })

    const blueprintJson = JSON.stringify(blueprint, null, 2)
    const publicBpPath = path.join(publicBlueprints, `${componentId}.json`)
    const repoBpPath = path.join(repoBlueprints, `${componentId}.json`)
    fs.writeFileSync(publicBpPath, blueprintJson, 'utf8')
    fs.writeFileSync(repoBpPath, blueprintJson, 'utf8')

    const catalog = readCatalog()
    const kind =
      body.kind === 'layout' ? 'layout' : 'component'
    const catalogEntry = {
      id: componentId,
      publishedAt: new Date().toISOString(),
      hasBlueprint: true,
      apiEndpoint: null,
      importId,
      thumbnailPath: blueprint.data.imageUrl,
      blueprintPath: `/blueprints/${componentId}.json`,
      kind,
    }
    mergeCatalogEntry(catalog, catalogEntry)
    writeCatalog(catalog)
    copyCatalogSchemaIfPresent()

    res.json({
      componentId,
      importId,
      blueprint,
      catalogEntry,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: String(e?.message || e) })
  }
})

app.post('/api/delete-component', (req, res) => {
  try {
    ensureDirs()
    const body = req.body || {}
    const componentId = toKebabComponentId(body.componentId)
    const catalog = readCatalog()
    catalog.components = catalog.components.filter((c) => c.id !== componentId)
    writeCatalog(catalog)

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

    res.json({ deleted: true, componentId })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: String(e?.message || e) })
  }
})

ensureDirs()
copyCatalogSchemaIfPresent()

app.listen(PORT, () => {
  console.log(`Publish helper listening on http://127.0.0.1:${PORT}`)
})
