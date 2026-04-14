/** Browser default when `html` font-size is not overridden. */
export const ROOT_PX_DEFAULT = 16

const REM_RE = /^(\d+(?:\.\d+)?)rem$/i
const PX_RE = /^(\d+(?:\.\d+)?)px$/i

/** Milli-rem step for ArrowUp / ArrowDown (0.001rem). */
export const FONT_SIZE_REM_STEP_MILLIS = 1

function formatRemToken(rem: number): string {
  const t = (Math.round(rem * 1000) / 1000).toFixed(3).replace(/\.?0+$/, '')
  return t === '' ? '0' : t
}

/**
 * When the value is a full `Nrem` or `Npx` token, step by 0.001rem or ±1px.
 * Returns null if stepping does not apply (partial edit, `em`, etc.).
 */
export function stepFontSizeValue(
  raw: string,
  direction: 1 | -1,
  remStepMillis: number = FONT_SIZE_REM_STEP_MILLIS,
): string | null {
  const s = raw.trim()
  const remMatch = s.match(REM_RE)
  if (remMatch) {
    const millis = Math.round(Number.parseFloat(remMatch[1]) * 1000)
    if (Number.isNaN(millis)) return null
    const nextMillis = millis + direction * remStepMillis
    const clamped = Math.max(1, nextMillis)
    const rem = clamped / 1000
    return `${formatRemToken(rem)}rem`
  }
  const pxMatch = s.match(PX_RE)
  if (pxMatch) {
    let px = Number.parseFloat(pxMatch[1])
    if (Number.isNaN(px)) return null
    px = Math.round(px) + direction
    if (px < 1) px = 1
    return `${px}px`
  }
  return null
}

/** Unitless line-height token (same rule as theme validation `lh-theme-*`). */
const LH_UNITLESS_FULL_RE = /^\d+(?:\.\d+)?$/

/** Milli-unit step for ArrowUp / ArrowDown on line-height fields (0.001). */
export const LINE_HEIGHT_STEP_MILLIS = 1

/**
 * Steps a complete unitless line-height (e.g. `1.625`) by ±0.001.
 * Clamps at 0. Returns null if the string is not a full valid token.
 */
export function stepLineHeightValue(
  raw: string,
  direction: 1 | -1,
  stepMillis: number = LINE_HEIGHT_STEP_MILLIS,
): string | null {
  const s = raw.trim()
  if (!LH_UNITLESS_FULL_RE.test(s)) return null
  const millis = Math.round(Number.parseFloat(s) * 1000)
  if (Number.isNaN(millis)) return null
  const nextMillis = millis + direction * stepMillis
  const clamped = Math.max(0, nextMillis)
  const v = clamped / 1000
  return formatRemToken(v)
}

function formatPx(px: number): string {
  const rounded = Math.round(px * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

function formatRem(rem: number): string {
  const rounded = Math.round(rem * 1000) / 1000
  const s = rounded.toFixed(3).replace(/\.?0+$/, '')
  return s === '' ? '0' : s
}

/**
 * Read-only hint for Theme typography `fs-*` inputs: rem → px or px → rem at a given root.
 * Returns null if the value is empty or not a plain rem/px size.
 */
export function fontSizeInputHint(
  raw: string,
  rootPx: number = ROOT_PX_DEFAULT,
): string | null {
  const s = raw.trim()
  if (s.length === 0 || rootPx <= 0) return null

  const remMatch = s.match(REM_RE)
  if (remMatch) {
    const rem = Number.parseFloat(remMatch[1])
    if (Number.isNaN(rem)) return null
    const px = rem * rootPx
    return `≈ ${formatPx(px)}px (1rem = ${rootPx}px root)`
  }

  const pxMatch = s.match(PX_RE)
  if (pxMatch) {
    const px = Number.parseFloat(pxMatch[1])
    if (Number.isNaN(px)) return null
    const rem = px / rootPx
    return `≈ ${formatRem(rem)}rem (${rootPx}px root)`
  }

  return null
}

/**
 * When font size is `rem`/`px` and line height is unitless, show approximate used
 * line box height in px (font-size × line-height).
 */
export function lineBoxHeightHint(
  fontSizeRaw: string,
  lineHeightRaw: string,
  rootPx: number = ROOT_PX_DEFAULT,
): string | null {
  const lhStr = lineHeightRaw.trim()
  if (!LH_UNITLESS_FULL_RE.test(lhStr)) return null
  const lh = Number.parseFloat(lhStr)
  if (Number.isNaN(lh) || rootPx <= 0) return null

  const fs = fontSizeRaw.trim()
  const remMatch = fs.match(REM_RE)
  if (remMatch) {
    const rem = Number.parseFloat(remMatch[1])
    if (Number.isNaN(rem)) return null
    const linePx = rem * rootPx * lh
    return `≈ ${formatPx(linePx)}px line box (${rootPx}px root)`
  }
  const pxMatch = fs.match(PX_RE)
  if (pxMatch) {
    const fpx = Number.parseFloat(pxMatch[1])
    if (Number.isNaN(fpx)) return null
    const linePx = fpx * lh
    return `≈ ${formatPx(linePx)}px line box`
  }
  return null
}
