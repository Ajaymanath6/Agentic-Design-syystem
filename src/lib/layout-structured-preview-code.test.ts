import { describe, expect, it } from 'vitest'
import { buildStructuredPreviewHtml } from './layout-structured-preview-code'
import type { CatalogCardModel } from '../types/catalog'
import type { LayoutPlanV1 } from '../types/layout-plan'

describe('buildStructuredPreviewHtml', () => {
  it('includes chrome classes and catalog sourceHtml', () => {
    const cards: CatalogCardModel[] = [
      {
        entry: {
          id: 'demo-x',
          importId: 'DemoX',
          thumbnailPath: '',
          blueprintPath: '',
          publishedAt: '',
          hasBlueprint: true,
          apiEndpoint: null,
        },
        blueprint: {
          schemaVersion: '1.0',
          id: 'demo-x',
          component: 'demo-x',
          importId: 'DemoX',
          data: {
            sourceHtml: '<div class="p-1">Hi</div>',
          },
        },
      },
    ]
    const plan: LayoutPlanV1 = {
      version: 1,
      blocks: [
        {
          type: 'chrome',
          kind: 'pageHeading',
          title: 'T',
          subtitle: 'S',
          titleThemeKey: 'heading.h2',
          subtitleThemeKey: 'profileCard.title',
        },
        { type: 'catalog', ref: 'demo-x', repeat: 1, layout: 'flow' },
      ],
    }
    const out = buildStructuredPreviewHtml(plan, cards)
    expect(out).toContain('<h2 class="')
    expect(out).toContain('T</h2>')
    expect(out).toContain('<p class="')
    expect(out).toContain('S</p>')
    expect(out).toContain('<div class="p-1">Hi</div>')
  })

  it('wraps row columns in data-layout row', () => {
    const cards: CatalogCardModel[] = [
      {
        entry: {
          id: 'a',
          importId: 'A',
          thumbnailPath: '',
          blueprintPath: '',
          publishedAt: '',
          hasBlueprint: true,
          apiEndpoint: null,
        },
        blueprint: {
          id: 'a',
          data: { sourceHtml: '<span>a</span>' },
        },
      },
      {
        entry: {
          id: 'b',
          importId: 'B',
          thumbnailPath: '',
          blueprintPath: '',
          publishedAt: '',
          hasBlueprint: true,
          apiEndpoint: null,
        },
        blueprint: {
          id: 'b',
          data: { sourceHtml: '<span>b</span>' },
        },
      },
    ]
    const plan: LayoutPlanV1 = {
      version: 1,
      blocks: [
        {
          type: 'row',
          stackBelow: 'md',
          columns: [
            {
              children: [
                { type: 'catalog', ref: 'a', repeat: 1, layout: 'flow' },
              ],
            },
            {
              children: [
                { type: 'catalog', ref: 'b', repeat: 1, layout: 'flow' },
              ],
            },
          ],
        },
      ],
    }
    const out = buildStructuredPreviewHtml(plan, cards)
    expect(out).toContain('data-layout="row"')
    expect(out).toContain('<span>a</span>')
    expect(out).toContain('<span>b</span>')
  })
})
