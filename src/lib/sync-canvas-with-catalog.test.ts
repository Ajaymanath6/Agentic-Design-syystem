import { describe, expect, it } from 'vitest'

import type { CatalogCardModel } from '../types/catalog'
import {
  canvasNodeFromCatalogCard,
  mergePublishedCatalogOntoCanvas,
  parseCanvasComponentCatalogId,
} from './sync-canvas-with-catalog'
import { componentCatalogIdForCanvasNode } from './canvas-node-publish'

describe('parseCanvasComponentCatalogId', () => {
  it('parses canvas-html uuid ids', () => {
    const id = 'canvas-html-550e8400-e29b-41d4-a716-446655440000'
    expect(parseCanvasComponentCatalogId(id)).toEqual({
      kind: 'htmlSnippet',
      nodeId: '550e8400-e29b-41d4-a716-446655440000',
    })
  })

  it('parses canvas-primary uuid ids', () => {
    const id = 'canvas-primary-550e8400-e29b-41d4-a716-446655440000'
    expect(parseCanvasComponentCatalogId(id)?.kind).toBe('primaryButton')
  })
})

describe('mergePublishedCatalogOntoCanvas', () => {
  it('adds catalog rows missing from the board', () => {
    const nodeId = '550e8400-e29b-41d4-a716-446655440000'
    const card: CatalogCardModel = {
      entry: {
        id: `canvas-html-${nodeId}`,
        publishedAt: '2026-01-01',
        hasBlueprint: true,
        apiEndpoint: null,
        importId: 'X',
        thumbnailPath: '/x.png',
        blueprintPath: '/x.json',
      },
      blueprint: {
        id: `canvas-html-${nodeId}`,
        data: {
          imageAlt: 'Hero',
          sourceHtml: '<section><h2>Hero</h2></section>',
        },
      },
    }
    const merged = mergePublishedCatalogOntoCanvas([], [card])
    expect(merged).toHaveLength(1)
    expect(merged[0]?.kind).toBe('htmlSnippet')
    expect(merged[0]?.id).toBe(nodeId)
    expect(componentCatalogIdForCanvasNode(merged[0]!)).toBe(card.entry.id)
  })

  it('does not duplicate rows already on the board', () => {
    const nodeId = '550e8400-e29b-41d4-a716-446655440000'
    const existing = [
      {
        kind: 'htmlSnippet' as const,
        id: nodeId,
        x: 100,
        y: 100,
        label: 'Hero',
        html: '<p>Hi</p>',
      },
    ]
    const card: CatalogCardModel = {
      entry: {
        id: `canvas-html-${nodeId}`,
        publishedAt: '2026-01-01',
        hasBlueprint: true,
        apiEndpoint: null,
        importId: 'X',
        thumbnailPath: '/x.png',
        blueprintPath: '/x.json',
      },
      blueprint: {
        id: `canvas-html-${nodeId}`,
        data: { imageAlt: 'Hero', sourceHtml: '<p>Hi</p>' },
      },
    }
    const merged = mergePublishedCatalogOntoCanvas(existing, [card])
    expect(merged).toHaveLength(1)
    expect(merged[0]).toBe(existing[0])
  })
})

describe('canvasNodeFromCatalogCard', () => {
  it('rebuilds html snippets from blueprint sourceHtml', () => {
    const nodeId = '550e8400-e29b-41d4-a716-446655440000'
    const node = canvasNodeFromCatalogCard({
      entry: {
        id: `canvas-html-${nodeId}`,
        publishedAt: '',
        hasBlueprint: true,
        apiEndpoint: null,
        importId: 'X',
        thumbnailPath: '',
        blueprintPath: '',
      },
      blueprint: {
        id: `canvas-html-${nodeId}`,
        data: {
          imageAlt: 'Pricing',
          sourceHtml: '<div>Pricing</div>',
        },
      },
    })
    expect(node?.kind).toBe('htmlSnippet')
    if (node?.kind === 'htmlSnippet') {
      expect(node.label).toBe('Pricing')
      expect(node.html).toContain('Pricing')
    }
  })
})
