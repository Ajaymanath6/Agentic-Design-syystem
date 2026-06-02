export const CTA_ARC_CENTER_X = 50
export const CTA_ARC_CENTER_Y = 100
export const CTA_ARC_RADIUS = 50

export const CTA_BOTTOM_ARC_PATH = `M 0 100 A ${CTA_ARC_RADIUS} ${CTA_ARC_RADIUS} 0 0 1 100 100 Z`

export const CTA_DIAGONAL_ARC_CURVE =
  'M 0 0 A 100 100 0 0 1 100 100'

export const CTA_TOP_REGION_CLIP = `M 0 0 H 100 V 100 H 0 Z M 0 100 A ${CTA_ARC_RADIUS} ${CTA_ARC_RADIUS} 0 0 0 100 100 Z`

export const CTA_GRID_STEP = 6.25

export function ctaArcYAt(x: number): number {
  const dx = x - CTA_ARC_CENTER_X
  const inside = CTA_ARC_RADIUS * CTA_ARC_RADIUS - dx * dx
  if (inside <= 0) {
    return CTA_ARC_CENTER_Y
  }
  return CTA_ARC_CENTER_Y - Math.sqrt(inside)
}

export function ctaDiagonalArcYAt(x: number): number {
  const inside = 100 * 100 - x * x
  if (inside <= 0) {
    return 100
  }
  return 100 - Math.sqrt(inside)
}
