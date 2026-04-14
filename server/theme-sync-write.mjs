/**
 * Theme sync: rewrite marker regions in brand-theme-colors.ts and index.css.
 * Used by publish-helper POST /api/theme/sync (localhost + optional secret).
 */
import fs from 'fs'
import path from 'path'

/** Must match BRAND_COLOR_DEFAULTS key order in src/config/brand-theme-colors.ts */
export const BRAND_COLOR_KEYS = [
  'brandcolor-primary',
  'brandcolor-primaryhover',
  'brandcolor-secondary',
  'brandcolor-secondaryhover',
  'brandcolor-secondaryfill',
  'brandcolor-neutralhover',
  'brandcolor-textstrong',
  'brandcolor-textweak',
  'brandcolor-strokestrong',
  'brandcolor-strokeweak',
  'brandcolor-strokemild',
  'brandcolor-strokelight',
  'brandcolor-fill',
  'brandcolor-white',
  'brandcolor-sidebarhover',
  'brandcolor-divider',
  'brandcolor-banner-info-bg',
  'brandcolor-banner-warning-bg',
  'brandcolor-banner-warning-button',
  'brandcolor-results-bg',
  'brandcolor-archived-bg',
  'brandcolor-archived-border',
  'brandcolor-archived-badge',
  'brandcolor-destructive',
  'brandcolor-table-header',
  'brandcolor-badge-success-bg',
  'brandcolor-badge-success-text',
  'brandcolor-badge-attorney-bg',
  'brandcolor-badge-attorney-text',
  'brandcolor-badge-amber-bg',
  'brandcolor-badge-amber-text',
]

const TS_START = '  // @agentic-brand-colors-start'
const TS_END = '  // @agentic-brand-colors-end'
const CSS_START = '    /* @agentic-theme-root-colors-start */'
const CSS_END = '    /* @agentic-theme-root-colors-end */'

function normalizeHex6(hex) {
  const raw = String(hex ?? '')
    .trim()
    .replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) {
    throw new Error(`Invalid hex (need #RRGGBB): ${hex}`)
  }
  return `#${raw.toUpperCase()}`
}

function hexToRgbTriple(hex) {
  const norm = normalizeHex6(hex).slice(1)
  const r = Number.parseInt(norm.slice(0, 2), 16)
  const g = Number.parseInt(norm.slice(2, 4), 16)
  const b = Number.parseInt(norm.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

/**
 * @param {Record<string, unknown>} input — body; expects { colors: Record<key, hex> }
 * @returns {Record<string, string>} full map for every BRAND_COLOR_KEYS entry
 */
export function mergeBrandColorsFromPayload(input) {
  if (input == null || typeof input !== 'object') {
    throw new Error('Body must be a JSON object')
  }
  const src = input.colors != null ? input.colors : input
  if (typeof src !== 'object' || src == null || Array.isArray(src)) {
    throw new Error('Expected { colors: { "brandcolor-primary": "#RRGGBB", ... } }')
  }
  const out = {}
  for (const key of BRAND_COLOR_KEYS) {
    if (src[key] == null || String(src[key]).trim() === '') {
      throw new Error(`Missing required key: ${key}`)
    }
    out[key] = normalizeHex6(src[key])
  }
  return out
}

function formatTsBlock(colors) {
  const lines = []
  for (const key of BRAND_COLOR_KEYS) {
    if (colors[key]) {
      lines.push(`  '${key}': '${colors[key]}',`)
    }
  }
  return lines.join('\n')
}

function formatCssRootBlock(colors) {
  const lines = []
  for (const key of BRAND_COLOR_KEYS) {
    if (colors[key]) {
      const triple = hexToRgbTriple(colors[key])
      lines.push(`    --color-${key}: ${triple};`)
    }
  }
  return lines.join('\n')
}

function replaceMarkedRegion(full, startMarker, endMarker, newInner) {
  const i0 = full.indexOf(startMarker)
  const i1 = full.indexOf(endMarker)
  if (i0 === -1 || i1 === -1) {
    throw new Error(
      `Marker not found: ${startMarker.slice(0, 40)}… or end marker missing`,
    )
  }
  if (i1 <= i0) {
    throw new Error('Invalid marker order in file')
  }
  const afterStart = i0 + startMarker.length
  const beforeEnd = i1
  return (
    full.slice(0, afterStart) +
    '\n' +
    newInner +
    '\n' +
    full.slice(beforeEnd)
  )
}

/**
 * @param {string} projectRoot
 * @param {Record<string, string>} colors — must include every BRAND_COLOR_KEYS entry to write
 */
export function writeThemeBrandColors(projectRoot, colors) {
  const tsPath = path.join(
    projectRoot,
    'src',
    'config',
    'brand-theme-colors.ts',
  )
  const cssPath = path.join(projectRoot, 'src', 'index.css')

  const fullColors = {}
  for (const key of BRAND_COLOR_KEYS) {
    if (!colors[key]) {
      throw new Error(`Missing color for ${key}`)
    }
    fullColors[key] = normalizeHex6(colors[key])
  }

  const tsBody = formatTsBlock(fullColors)
  let ts = fs.readFileSync(tsPath, 'utf8')
  ts = replaceMarkedRegion(ts, TS_START, TS_END, tsBody)
  fs.writeFileSync(tsPath, ts, 'utf8')

  const cssBody = formatCssRootBlock(fullColors)
  let css = fs.readFileSync(cssPath, 'utf8')
  css = replaceMarkedRegion(css, CSS_START, CSS_END, cssBody)
  fs.writeFileSync(cssPath, css, 'utf8')

  return { tsPath, cssPath }
}

/** Must match `SHADOW_KEYS` in src/config/theme-shadow-defaults.ts */
export const THEME_SHADOW_KEYS = [
  'button-press',
  'border-inset-strokelight',
  'border-inset-secondary',
  'border-inset-secondary-press',
  'header',
  'tab-option',
  'card',
  'sidebar-toggle',
  'confirm-password-valid',
  'button-brand-glow',
]

/** Must match `TYPOGRAPHY_KEYS` in src/config/theme-typography-defaults.ts */
export const THEME_TYPOGRAPHY_KEYS = [
  'font-sans-stack',
  'font-lora-stack',
  'fs-theme-title-h1',
  'lh-theme-title-h1',
  'fs-theme-title-h2',
  'lh-theme-title-h2',
  'fs-theme-title-h3',
  'lh-theme-title-h3',
  'fs-theme-title-h4',
  'lh-theme-title-h4',
  'fs-theme-title-h5',
  'lh-theme-title-h5',
  'fs-theme-title-h6',
  'lh-theme-title-h6',
  'fs-theme-body-large-regular',
  'lh-theme-body-large-regular',
  'fs-theme-body-large-emphasis',
  'lh-theme-body-large-emphasis',
  'fs-theme-body-large-bold',
  'lh-theme-body-large-bold',
  'fs-theme-body-medium-regular',
  'lh-theme-body-medium-regular',
  'fs-theme-body-medium-emphasis',
  'lh-theme-body-medium-emphasis',
  'fs-theme-body-medium-bold',
  'lh-theme-body-medium-bold',
  'fs-theme-body-small-regular',
  'lh-theme-body-small-regular',
  'fs-theme-body-small-emphasis',
  'lh-theme-body-small-emphasis',
  'fs-theme-body-small-bold',
  'lh-theme-body-small-bold',
  'fw-theme-regular',
  'fw-theme-medium',
  'fw-theme-semibold',
  'fw-theme-bold',
]

const CSS_SHADOW_START = '    /* @agentic-theme-shadows-start */'
const CSS_SHADOW_END = '    /* @agentic-theme-shadows-end */'
const CSS_TYPO_START = '    /* @agentic-theme-typography-start */'
const CSS_TYPO_END = '    /* @agentic-theme-typography-end */'

const SHADOW_TS_START = '  // @agentic-theme-shadow-defaults-start'
const SHADOW_TS_END = '  // @agentic-theme-shadow-defaults-end'
const TYPO_TS_START = '  // @agentic-theme-typography-defaults-start'
const TYPO_TS_END = '  // @agentic-theme-typography-defaults-end'

const SHADOW_VALUE_MAX_LEN = 800

function validateShadowValueSrv(raw) {
  const s = String(raw ?? '').trim()
  if (s.length === 0 || s.length > SHADOW_VALUE_MAX_LEN) return null
  const low = s.toLowerCase()
  if (
    low.includes('url(') ||
    low.includes('expression(') ||
    low.includes('<') ||
    low.includes('javascript:')
  ) {
    return null
  }
  return s
}

function validateTypographyValueSrv(key, raw) {
  const s = String(raw ?? '').trim()
  if (s.length === 0) return null
  if (key === 'font-sans-stack' || key === 'font-lora-stack') {
    if (s.length > 400) return null
    const low = s.toLowerCase()
    if (
      low.includes('url(') ||
      low.includes('expression(') ||
      low.includes('<') ||
      low.includes('javascript:')
    ) {
      return null
    }
    return s
  }
  if (String(key).startsWith('fs-theme-')) {
    return /^\d+(\.\d+)?(rem|px)$/i.test(s) ? s : null
  }
  if (String(key).startsWith('lh-theme-')) {
    return /^\d+(\.\d+)?$/.test(s) ? s : null
  }
  if (String(key).startsWith('fw-theme-')) {
    return /^(100|200|300|400|500|600|700|800|900)$/.test(s) ? s : null
  }
  return null
}

/**
 * @param {Record<string, unknown>} body
 * @returns {Record<string, string> | null} full shadow map, or null if `shadows` omitted
 */
export function mergeShadowsFromPayload(body) {
  if (body == null || typeof body !== 'object') return null
  if (!Object.prototype.hasOwnProperty.call(body, 'shadows')) return null
  const s = body.shadows
  if (s == null) return null
  if (typeof s !== 'object' || Array.isArray(s)) {
    throw new Error('Expected shadows to be an object of token → string')
  }
  const out = {}
  for (const key of THEME_SHADOW_KEYS) {
    if (s[key] == null || String(s[key]).trim() === '') {
      throw new Error(`Missing shadow key: ${key}`)
    }
    const ok = validateShadowValueSrv(s[key])
    if (!ok) throw new Error(`Invalid shadow value for ${key}`)
    out[key] = ok
  }
  return out
}

/**
 * @param {Record<string, unknown>} body
 * @returns {Record<string, string> | null}
 */
export function mergeTypographyFromPayload(body) {
  if (body == null || typeof body !== 'object') return null
  if (!Object.prototype.hasOwnProperty.call(body, 'typography')) return null
  const s = body.typography
  if (s == null) return null
  if (typeof s !== 'object' || Array.isArray(s)) {
    throw new Error('Expected typography to be an object of token → string')
  }
  const out = {}
  for (const key of THEME_TYPOGRAPHY_KEYS) {
    if (s[key] == null || String(s[key]).trim() === '') {
      throw new Error(`Missing typography key: ${key}`)
    }
    const ok = validateTypographyValueSrv(key, s[key])
    if (!ok) throw new Error(`Invalid typography value for ${key}`)
    out[key] = ok
  }
  return out
}

function formatTsQuotedObject(map, keys) {
  const lines = []
  for (const key of keys) {
    lines.push(`  '${key}': ${JSON.stringify(map[key])},`)
  }
  return lines.join('\n')
}

function formatCssShadowBlock(shadows) {
  const lines = []
  for (const key of THEME_SHADOW_KEYS) {
    const v = String(shadows[key]).replace(/\s+/g, ' ').trim()
    lines.push(`    --shadow-${key}: ${v};`)
  }
  return lines.join('\n')
}

function formatCssTypographyBlock(typo) {
  const lines = []
  for (const key of THEME_TYPOGRAPHY_KEYS) {
    const v = String(typo[key]).trim()
    lines.push(`    --${key}: ${v};`)
  }
  return lines.join('\n')
}

/**
 * @param {string} projectRoot
 * @param {Record<string, string>} shadows — every THEME_SHADOW_KEYS
 */
export function writeThemeShadowArtifacts(projectRoot, shadows) {
  const tsPath = path.join(
    projectRoot,
    'src',
    'config',
    'theme-shadow-defaults.ts',
  )
  const cssPath = path.join(projectRoot, 'src', 'index.css')
  const inner = formatTsQuotedObject(shadows, THEME_SHADOW_KEYS)
  let ts = fs.readFileSync(tsPath, 'utf8')
  ts = replaceMarkedRegion(ts, SHADOW_TS_START, SHADOW_TS_END, inner)
  fs.writeFileSync(tsPath, ts, 'utf8')

  const cssInner = formatCssShadowBlock(shadows)
  let css = fs.readFileSync(cssPath, 'utf8')
  css = replaceMarkedRegion(css, CSS_SHADOW_START, CSS_SHADOW_END, cssInner)
  fs.writeFileSync(cssPath, css, 'utf8')

  return { tsPath, cssPath }
}

/**
 * @param {string} projectRoot
 * @param {Record<string, string>} typo — every THEME_TYPOGRAPHY_KEYS
 */
export function writeThemeTypographyArtifacts(projectRoot, typo) {
  const tsPath = path.join(
    projectRoot,
    'src',
    'config',
    'theme-typography-defaults.ts',
  )
  const cssPath = path.join(projectRoot, 'src', 'index.css')
  const inner = formatTsQuotedObject(typo, THEME_TYPOGRAPHY_KEYS)
  let ts = fs.readFileSync(tsPath, 'utf8')
  ts = replaceMarkedRegion(ts, TYPO_TS_START, TYPO_TS_END, inner)
  fs.writeFileSync(tsPath, ts, 'utf8')

  const cssInner = formatCssTypographyBlock(typo)
  let css = fs.readFileSync(cssPath, 'utf8')
  css = replaceMarkedRegion(css, CSS_TYPO_START, CSS_TYPO_END, cssInner)
  fs.writeFileSync(cssPath, css, 'utf8')

  return { tsPath, cssPath }
}
