import { describe, expect, it } from 'vitest'
import type { CatalogCardModel } from '../types/catalog'
import { buildCatalogAllowlist, findCardByPlanRef } from './layout-plan-catalog'

const mockCard: CatalogCardModel = {
  entry: {
    id: 'entry-id-1',
    publishedAt: '2020-01-01',
    hasBlueprint: true,
    apiEndpoint: null,
    importId: 'case-card',
    thumbnailPath: '',
    blueprintPath: '/x.json',
  },
  blueprint: {
    id: 'bp1',
    component: 'CaseCardComponent',
    data: {},
  },
}

describe('layout-plan-catalog', () => {
  it('buildCatalogAllowlist collects ids and component names', () => {
    const list = buildCatalogAllowlist([mockCard])
    expect(list).toContain('case-card')
    expect(list).toContain('entry-id-1')
    expect(list).toContain('CaseCardComponent')
  })

  it('findCardByPlanRef matches server canonical ref', () => {
    expect(findCardByPlanRef('case-card', [mockCard])).toBe(mockCard)
  })

  it('findCardByPlanRef matches PascalCase component name', () => {
    expect(findCardByPlanRef('CaseCardComponent', [mockCard])).toBe(mockCard)
  })
})
