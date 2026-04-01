export type BlueprintStructureNode = {
  component: string
  data?: { classes?: string; href?: string }
  text?: string
  label?: string
  children?: BlueprintStructureNode[]
}

const SKIP_TAGS = new Set(['script', 'style', 'svg'])

function textContentTrim(el: HTMLElement): string {
  return el.textContent?.trim() ?? ''
}

function walk(node: Node): BlueprintStructureNode | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent?.trim()
    if (!t) return null
    return { component: 'text', text: t }
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()
  if (SKIP_TAGS.has(tag)) return null

  const component =
    el.dataset.componentName ||
    el.dataset.component ||
    (tag === 'a' ? 'a' : tag)

  const data: { classes?: string; href?: string } = {}
  if (el.className && typeof el.className === 'string' && el.className.trim()) {
    data.classes = el.className.trim()
  }
  if (tag === 'a' && el instanceof HTMLAnchorElement && el.href) {
    data.href = el.getAttribute('href') ?? el.href
  }

  const childNodes = Array.from(el.childNodes)
    .map(walk)
    .filter((c): c is BlueprintStructureNode => c !== null)

  const directText = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent?.trim())
    .filter(Boolean)
    .join(' ')

  const hasElementChild = childNodes.some(
    (c) => c.component !== 'text' && c.component !== undefined,
  )

  const base: BlueprintStructureNode = {
    component,
    ...(Object.keys(data).length ? { data } : {}),
  }

  if (tag === 'button' && directText && !hasElementChild) {
    return { ...base, label: directText }
  }

  if (directText && childNodes.length === 0) {
    return { ...base, text: directText }
  }

  if (childNodes.length > 0) {
    return { ...base, children: childNodes }
  }

  const tc = textContentTrim(el)
  if (tc && !hasElementChild) {
    return tag === 'button' ? { ...base, label: tc } : { ...base, text: tc }
  }

  return base
}

export function createBlueprintStructure(
  root: HTMLElement,
): BlueprintStructureNode {
  const tree = walk(root)
  if (tree) return tree
  return { component: 'div', text: '' }
}
