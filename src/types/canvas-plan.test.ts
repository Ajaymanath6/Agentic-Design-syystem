import { describe, expect, it } from 'vitest'

import { isCanvasPlan, isCanvasPlanV1, isCanvasPlanV2 } from './canvas-plan'

describe('canvas plan guards', () => {
  it('accepts v1', () => {
    const p = {
      version: 1,
      nodes: [{ kind: 'card' as const, title: 'T', subtitle: '', body: '' }],
    }
    expect(isCanvasPlanV1(p)).toBe(true)
    expect(isCanvasPlanV2(p)).toBe(false)
    expect(isCanvasPlan(p)).toBe(true)
  })

  it('accepts v2 productSidebar (snake_case from API)', () => {
    const p = {
      version: 2,
      nodes: [
        {
          kind: 'productSidebar' as const,
          title: 'App',
          trailing_icon_key: 'chevronDown' as const,
          search_placeholder: 'Find',
          neutral_button_label: 'New',
          sections: [
            {
              heading: 'Workspace',
              items: [{ label: 'Home', icon_key: 'home' as const }],
            },
          ],
        },
      ],
    }
    expect(isCanvasPlanV2(p)).toBe(true)
    expect(isCanvasPlan(p)).toBe(true)
  })

  it('accepts v2 productSidebar with camelCase aliases', () => {
    const p = {
      version: 2,
      nodes: [
        {
          kind: 'productSidebar',
          title: 'App',
          trailingIconKey: 'none',
          sections: [
            {
              heading: 'Main',
              items: [{ label: 'Dash', iconKey: 'folder' }],
            },
          ],
        },
      ],
    }
    expect(isCanvasPlanV2(p)).toBe(true)
  })

  it('rejects invalid nav icon', () => {
    const p = {
      version: 2,
      nodes: [
        {
          kind: 'productSidebar',
          title: 'App',
          sections: [
            {
              heading: 'Main',
              items: [{ label: 'X', icon_key: 'rocket' }],
            },
          ],
        },
      ],
    }
    expect(isCanvasPlanV2(p)).toBe(false)
  })
})
