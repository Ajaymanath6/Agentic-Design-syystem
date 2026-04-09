import { describe, expect, it } from 'vitest'

import { coerceCanvasControlLabel } from './coerce-canvas-control-label'

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
})
