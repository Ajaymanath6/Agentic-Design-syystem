import { describe, expect, it } from 'vitest'

import {
  createHtmlSnippetCanvasNode,
  HTML_SNIPPET_BLOCK_H,
  HTML_SNIPPET_BLOCK_W,
} from './append-html-snippet-canvas-node'
import type { CanvasNode } from './canvas-node-publish'

describe('createHtmlSnippetCanvasNode', () => {
  it('creates htmlSnippet with expected shell size', () => {
    const n = createHtmlSnippetCanvasNode([], '<p>a</p>', 'My label')
    expect(n.kind).toBe('htmlSnippet')
    expect(n.html).toBe('<p>a</p>')
    expect(n.label).toBe('My label')
    expect(typeof n.id).toBe('string')
    expect(n.x).toBeGreaterThanOrEqual(40)
    expect(n.y).toBeGreaterThanOrEqual(40)
    expect(n.x + HTML_SNIPPET_BLOCK_W).toBeLessThanOrEqual(3200 - 40)
    expect(n.y + HTML_SNIPPET_BLOCK_H).toBeLessThanOrEqual(2400 - 40)
  })

  it('places new block above existing top edge (clamped to top margin)', () => {
    const existing: CanvasNode[] = [
      {
        kind: 'card',
        id: 'c1',
        x: 100,
        y: 200,
        title: 'T',
        subtitle: '',
        body: '',
      },
    ]
    const n = createHtmlSnippetCanvasNode(existing, '<div/>', 'L')
    expect(n.y).toBeLessThan(existing[0].y)
    expect(n.y).toBeGreaterThanOrEqual(40)
  })

  it('truncates long labels', () => {
    const long = 'x'.repeat(300)
    const n = createHtmlSnippetCanvasNode([], '<p/>', long)
    expect(n.label.length).toBe(200)
  })
})
