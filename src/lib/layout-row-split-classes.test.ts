import { describe, expect, it } from 'vitest'
import { rowOuterFlexClass } from './layout-row-split-classes'

describe('rowOuterFlexClass', () => {
  it('default uses row-first with max-sm stack', () => {
    expect(rowOuterFlexClass(undefined)).toContain('flex-row')
    expect(rowOuterFlexClass(undefined)).toContain('max-sm:flex-col')
  })

  it('sm matches default', () => {
    expect(rowOuterFlexClass('sm')).toBe(rowOuterFlexClass(undefined))
  })

  it('md uses mobile-first col until md', () => {
    const c = rowOuterFlexClass('md')
    expect(c).toContain('flex-col')
    expect(c).toContain('md:flex-row')
  })
})
