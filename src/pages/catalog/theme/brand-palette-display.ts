/** Display helpers for palette swatch metadata. */
export function hexToRgbDisplay(hex: string): string {
  const raw = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return 'rgb(0, 0, 0)'
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  return `rgb(${r}, ${g}, ${b})`
}

export function normalizeHexDisplay(hex: string): string {
  const raw = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return hex.toLowerCase()
  return `#${raw.toLowerCase()}`
}
