import { describe, expect, it } from 'vitest'

import { mapCanvasPlanToNewNodes } from './map-canvas-plan-to-nodes'
import type { CanvasPlanV2 } from '../types/canvas-plan'

describe('mapCanvasPlanToNewNodes', () => {
  it('maps v2 productSidebar to canvas node with sections', () => {
    const plan: CanvasPlanV2 = {
      version: 2,
      nodes: [
        {
          kind: 'productSidebar',
          title: 'KILA',
          trailing_icon_key: 'chevronUpDown',
          search_placeholder: 'Search…',
          neutral_button_label: 'Create',
          sections: [
            {
              heading: 'Workspace',
              items: [
                { label: 'Dashboard', icon_key: 'home' },
                { label: 'Projects', icon_key: 'folder' },
              ],
            },
          ],
        },
      ],
    }
    const out = mapCanvasPlanToNewNodes(plan, [])
    expect(out).toHaveLength(1)
    const n = out[0]
    expect(n.kind).toBe('productSidebar')
    if (n.kind !== 'productSidebar') return
    expect(n.title).toBe('KILA')
    expect(n.trailing_icon_key).toBe('chevronUpDown')
    expect(n.search_placeholder).toBe('Search…')
    expect(n.neutral_button_label).toBe('Create')
    expect(n.sections[0].items[1].icon_key).toBe('folder')
    expect(n.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  })

  it('stacks v1 nodes with expected kinds', () => {
    const plan = {
      version: 1 as const,
      nodes: [
        {
          kind: 'neutralButton' as const,
          label: 'OK',
        },
      ],
    }
    const out = mapCanvasPlanToNewNodes(plan, [])
    expect(out[0].kind).toBe('neutralButton')
  })
})
