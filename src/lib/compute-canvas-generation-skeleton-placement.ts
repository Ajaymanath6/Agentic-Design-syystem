import type { ComponentsCanvasAiMode } from '../context/ComponentsCanvasAiContext'
import { computeHtmlSnippetPlacementRect } from './append-html-snippet-canvas-node'
import type { CanvasNode } from './canvas-node-publish'

export type CanvasGenerationSkeletonPlacement = {
  x: number
  y: number
  w: number
  h: number
}

type NodeSizeFn = (node: CanvasNode) => { w: number; h: number }

/** Predict where the next AI block will land so the canvas can show a loading skeleton. */
export function computeCanvasGenerationSkeletonPlacement(args: {
  existingNodes: CanvasNode[]
  mode: ComponentsCanvasAiMode
  refIds: string[]
  addAsNewInstead: boolean
  nodeSize: NodeSizeFn
}): CanvasGenerationSkeletonPlacement | null {
  const { existingNodes, mode, refIds, addAsNewInstead, nodeSize } = args

  const replaceActive =
    mode === 'htmlCreator' && refIds.length === 1 && !addAsNewInstead

  if (replaceActive) {
    const target = existingNodes.find((n) => n.id === refIds[0])
    if (target) {
      const { w, h } = nodeSize(target)
      return { x: target.x, y: target.y, w, h }
    }
  }

  return computeHtmlSnippetPlacementRect(existingNodes)
}
