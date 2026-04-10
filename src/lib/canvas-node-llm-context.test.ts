import { describe, expect, it } from 'vitest'

import type { CanvasNode } from './canvas-node-publish'
import { buildCanvasReferencesForRequest } from './canvas-node-llm-context'

describe('buildCanvasReferencesForRequest', () => {
  const idPrimary = '11111111-1111-4111-8111-111111111111'
  const idSecondary = '22222222-2222-4222-8222-222222222222'
  const idField = '33333333-3333-4333-8333-333333333333'

  const nodes: CanvasNode[] = [
    {
      kind: 'secondaryButton',
      id: idSecondary,
      x: 0,
      y: 0,
      label: 'Secondary',
    },
    {
      kind: 'primaryButton',
      id: idPrimary,
      x: 0,
      y: 0,
      label: 'Primary',
    },
    {
      kind: 'textInputField',
      id: idField,
      x: 0,
      y: 0,
      label: 'Email',
    },
  ]

  it('lists explicit ref ids before ids parsed from prompt, in explicit array order', () => {
    const prompt = `wrap @canvas:${idField} in a card`
    const refs = buildCanvasReferencesForRequest(prompt, nodes, [
      idPrimary,
      idSecondary,
    ])
    expect(refs).toBeDefined()
    expect(refs!.map((r) => r.node_id)).toEqual([
      idPrimary,
      idSecondary,
      idField,
    ])
  })

  it('dedupes when explicit id also appears in prompt', () => {
    const prompt = `use @canvas:${idPrimary} again`
    const refs = buildCanvasReferencesForRequest(prompt, nodes, [idPrimary])
    expect(refs!.map((r) => r.node_id)).toEqual([idPrimary])
  })
})
