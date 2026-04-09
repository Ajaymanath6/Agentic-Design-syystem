import { describe, expect, it } from 'vitest'

import { summarizeAppendedCanvasNodes } from './summarize-canvas-appended-nodes'

describe('summarizeAppendedCanvasNodes', () => {
  it('describes empty append', () => {
    expect(summarizeAppendedCanvasNodes([])).toMatch(/no new components/i)
  })

  it('lists kinds and labels', () => {
    const s = summarizeAppendedCanvasNodes([
      {
        kind: 'card',
        id: '1',
        x: 0,
        y: 0,
        title: 'Hello',
        subtitle: 'Sub',
        body: 'Body',
      },
      {
        kind: 'neutralButton',
        id: '2',
        x: 0,
        y: 0,
        label: 'Cancel',
      },
    ])
    expect(s).toContain('card')
    expect(s).toContain('Hello')
    expect(s).toContain('neutralButton')
    expect(s).toContain('Cancel')
  })

  it('uses title for productSidebar', () => {
    const s = summarizeAppendedCanvasNodes([
      {
        kind: 'productSidebar',
        id: '1',
        x: 0,
        y: 0,
        title: 'My app nav',
        trailing_icon_key: 'none',
        search_placeholder: '',
        neutral_button_label: '',
        sections: [
          { heading: 'A', items: [{ label: 'B', icon_key: 'none' }] },
        ],
      },
    ])
    expect(s).toContain('productSidebar')
    expect(s).toContain('My app nav')
  })
})
