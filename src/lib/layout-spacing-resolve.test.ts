import { describe, expect, it } from 'vitest'
import {
  getMarginBottomClassForAfterGap,
  inferLayoutAfterGap,
  isLayoutAfterGap,
  LAYOUT_AFTER_GAP_DEFAULT,
  resolveLayoutAfterGap,
} from './layout-spacing-resolve'

describe('layout-spacing-resolve', () => {
  it('maps tokens to mb-* classes', () => {
    expect(getMarginBottomClassForAfterGap('tight')).toBe('mb-2')
    expect(getMarginBottomClassForAfterGap('default')).toBe('mb-4')
    expect(getMarginBottomClassForAfterGap('section')).toBe('mb-6')
    expect(getMarginBottomClassForAfterGap('hero')).toBe('mb-8')
  })

  it('falls back for undefined and unknown strings', () => {
    expect(getMarginBottomClassForAfterGap(undefined)).toBe('mb-6')
    expect(getMarginBottomClassForAfterGap('bogus')).toBe('mb-6')
    expect(getMarginBottomClassForAfterGap(undefined, 'tight')).toBe('mb-2')
  })

  it('isLayoutAfterGap', () => {
    expect(isLayoutAfterGap('section')).toBe(true)
    expect(isLayoutAfterGap('nope')).toBe(false)
  })

  it('default constant', () => {
    expect(LAYOUT_AFTER_GAP_DEFAULT).toBe('section')
  })

  it('inferLayoutAfterGap: form stack vs section break', () => {
    expect(
      inferLayoutAfterGap(
        { type: 'chrome' },
        { type: 'catalog' },
      ),
    ).toBe('default')
    expect(
      inferLayoutAfterGap(
        { type: 'catalog' },
        { type: 'catalog' },
      ),
    ).toBe('default')
    expect(
      inferLayoutAfterGap(
        { type: 'catalog' },
        { type: 'chrome' },
      ),
    ).toBe('section')
  })

  it('infers default for row/split with catalog/chrome (form rhythm)', () => {
    expect(
      inferLayoutAfterGap({ type: 'row' }, { type: 'catalog' }),
    ).toBe('default')
    expect(
      inferLayoutAfterGap({ type: 'split' }, { type: 'chrome' }),
    ).toBe('default')
    expect(
      inferLayoutAfterGap({ type: 'catalog' }, { type: 'split' }),
    ).toBe('default')
    expect(
      inferLayoutAfterGap({ type: 'chrome' }, { type: 'row' }),
    ).toBe('default')
  })

  it('infers section between row and split layout regions', () => {
    expect(
      inferLayoutAfterGap({ type: 'row' }, { type: 'split' }),
    ).toBe('section')
    expect(
      inferLayoutAfterGap({ type: 'split' }, { type: 'row' }),
    ).toBe('section')
  })

  it('resolveLayoutAfterGap respects explicit and plan default', () => {
    expect(
      resolveLayoutAfterGap(
        { type: 'catalog', afterGap: 'hero' },
        { type: 'catalog' },
        undefined,
      ),
    ).toBe('hero')
    expect(
      resolveLayoutAfterGap(
        { type: 'catalog' },
        { type: 'catalog' },
        'tight',
      ),
    ).toBe('tight')
    expect(
      resolveLayoutAfterGap(
        { type: 'chrome' },
        { type: 'catalog' },
        undefined,
      ),
    ).toBe('default')
  })
})
