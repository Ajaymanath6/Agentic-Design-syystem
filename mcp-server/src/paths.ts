import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Agentic monorepo root: env `AGENTIC_ROOT`, else walk up from this file until
 * `public/blueprints/_catalog.json` exists (`dist/src/index.js` needs 3 hops; legacy `dist/index.js` used 2).
 */
export function getAgenticRoot(): string {
  const fromEnv = process.env.AGENTIC_ROOT?.trim()
  if (fromEnv) {
    return path.resolve(fromEnv)
  }
  const here = path.dirname(fileURLToPath(import.meta.url))
  for (const depth of [4, 3, 2] as const) {
    const candidate = path.resolve(here, ...Array(depth).fill('..'))
    const marker = path.join(
      candidate,
      'public',
      'blueprints',
      '_catalog.json',
    )
    if (fs.existsSync(marker)) {
      return candidate
    }
  }
  return path.resolve(here, '..', '..', '..')
}

/**
 * When set, blueprints are read from this directory directly (`_catalog.json` + `*.json`).
 * Otherwise: `AGENTIC_ROOT/public/blueprints` (default Agentic layout).
 */
export function getBlueprintsDir(): string {
  const override = process.env.AGENTIC_BLUEPRINTS_DIR?.trim()
  if (override) {
    return path.resolve(override)
  }
  return path.join(getAgenticRoot(), 'public', 'blueprints')
}
