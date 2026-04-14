import { describe, expect, it } from 'vitest'

import {
  coerceCanvasControlLabel,
  coerceCanvasPublishTitle,
} from './coerce-canvas-control-label'

describe('coerceCanvasControlLabel', () => {
  it('leaves short labels unchanged', () => {
    expect(coerceCanvasControlLabel('Submit')).toBe('Submit')
    expect(coerceCanvasControlLabel('Primary button')).toBe('Primary button')
  })

  it('extracts text after name it (including common typos)', () => {
    const raw =
      'create a primary button naem it primary buuton, the bg of thsihsoudbe primarycolor an don hover the bg hsoud chage yto primary hover'
    expect(coerceCanvasControlLabel(raw)).toBe('primary buuton')
  })

  it('extracts quoted phrase', () => {
    const raw =
      'Add a button labeled "Save draft" with primary styling and hover states described in the theme'
    expect(coerceCanvasControlLabel(raw)).toBe('Save draft')
  })

  it('shortens long card-style prompt for catalog title', () => {
    const raw =
      'create a new card which has title sub title one and a paragraph which shows dummy case details of a case between google and apple'
    const out = coerceCanvasControlLabel(raw)
    expect(out.length).toBeLessThan(raw.length)
    expect(out.endsWith('…')).toBe(true)
  })

  it('shortens sub-SOFT_MAX button prompts that use with/as instructions', () => {
    const raw = 'creata buuton with green colro as bg'
    expect(coerceCanvasControlLabel(raw)).toBe('creata buuton')
  })
})

describe('coerceCanvasPublishTitle', () => {
  it('caps verb-led prompts to one word for Publish modal', () => {
    const raw = 'creata an new buuton with green background in a modal dialog'
    expect(coerceCanvasPublishTitle(raw)).toBe('buuton')
  })

  it('reduces coerced two-word verb heads to one object word', () => {
    expect(coerceCanvasPublishTitle('creata buuton with green colro as bg')).toBe(
      'buuton',
    )
  })

  it('does not trim intentional three-word labels without instruction cues', () => {
    expect(coerceCanvasPublishTitle('Load more items')).toBe('Load more items')
  })
})
