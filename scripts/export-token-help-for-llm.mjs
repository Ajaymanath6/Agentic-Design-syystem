/**
 * Optional: regenerate LLM agent/knowledge/token-help.json from TS help modules.
 * Run: node scripts/export-token-help-for-llm.mjs
 *
 * Today token-help.json is hand-curated; this script appends spacing keys with defaults only.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outPath = path.join(root, 'LLM agent', 'knowledge', 'token-help.json')

const spacingKeys = ['micro', 'tight', 'cozy', 'section', 'hero', 'inline']

let existing = []
try {
  existing = JSON.parse(fs.readFileSync(outPath, 'utf8'))
} catch {
  existing = []
}

const ids = new Set(existing.map((e) => e.id))
for (const key of spacingKeys) {
  const id = `spacing-${key}`
  if (ids.has(id)) continue
  existing.push({
    id,
    title: `${key} spacing`,
    triggers: [key],
    text: `Theme spacing token "${key}" — use gap-${key}, p-${key}, space-y-${key} per theme-guide; not default Tailwind numeric scale.`,
  })
}

fs.writeFileSync(outPath, `${JSON.stringify(existing, null, 2)}\n`, 'utf8')
console.log(`Wrote ${existing.length} entries to ${outPath}`)
