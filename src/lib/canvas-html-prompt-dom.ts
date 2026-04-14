import { makeCanvasRefSentinel } from './canvas-prompt-sentinel'

/** Shared Tailwind classes for inline canvas-ref chips (contenteditable + fillEditor). */
export const CANVAS_HTML_PROMPT_CHIP_CLASS =
  'mx-0.5 inline-flex max-w-[min(100%,14rem)] items-center gap-0.5 align-middle rounded border border-brandcolor-strokeweak/60 bg-brandcolor-fill py-0.5 pl-1 pr-0.5 text-[13px] leading-snug text-brandcolor-textstrong'

export function nodeSerializedLength(n: Node): number {
  if (n.nodeType === Node.TEXT_NODE) {
    return (n.textContent ?? '').length
  }
  if (n.nodeType === Node.ELEMENT_NODE) {
    const el = n as HTMLElement
    const id = el.dataset.canvasRefId
    if (id) return makeCanvasRefSentinel(id).length
    let s = 0
    for (const c of el.childNodes) s += nodeSerializedLength(c)
    return s
  }
  return 0
}

/** Serialize editor DOM to the canonical string (sentinels for chips). */
export function serializeEditorRoot(root: HTMLElement): string {
  let out = ''
  function visit(n: Node) {
    if (n.nodeType === Node.TEXT_NODE) {
      out += n.textContent ?? ''
      return
    }
    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as HTMLElement
      const id = el.dataset.canvasRefId
      if (id) {
        out += makeCanvasRefSentinel(id)
        return
      }
      for (const c of el.childNodes) visit(c)
    }
  }
  for (const c of root.childNodes) visit(c)
  return out
}

export function getSerializedCaretIndex(
  root: HTMLElement,
  target: Node,
  targetOffset: number,
): number {
  if (!root.contains(target)) return 0

  let pos = 0

  function visit(parent: Node): boolean {
    for (const child of parent.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        if (el.dataset.canvasRefId) {
          if (el === target || el.contains(target)) {
            pos += makeCanvasRefSentinel(el.dataset.canvasRefId).length
            return true
          }
          pos += makeCanvasRefSentinel(el.dataset.canvasRefId).length
          continue
        }
      }
      if (child === target) {
        if (target.nodeType === Node.TEXT_NODE) {
          pos += targetOffset
          return true
        }
        if (target.nodeType === Node.ELEMENT_NODE) {
          const el = target as HTMLElement
          for (let j = 0; j < targetOffset; j++) {
            pos += nodeSerializedLength(el.childNodes[j]!)
          }
          return true
        }
      }
      if (child.contains(target)) {
        return visit(child)
      }
      pos += nodeSerializedLength(child)
    }
    return false
  }

  if (target === root) {
    for (let j = 0; j < targetOffset; j++) {
      pos += nodeSerializedLength(root.childNodes[j]!)
    }
    return pos
  }

  visit(root)
  return pos
}

export function setCaretAtSerializedIndex(
  root: HTMLElement,
  serializedIndex: number,
): void {
  const sel = window.getSelection()
  if (!sel) return
  const selection = sel
  let remaining = Math.max(0, serializedIndex)

  function walk(n: Node): boolean {
    if (n.nodeType === Node.TEXT_NODE) {
      const len = (n.textContent ?? '').length
      if (remaining <= len) {
        selection.removeAllRanges()
        const r = document.createRange()
        r.setStart(n, remaining)
        r.collapse(true)
        selection.addRange(r)
        return true
      }
      remaining -= len
      return false
    }
    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as HTMLElement
      const id = el.dataset.canvasRefId
      if (id) {
        const slen = makeCanvasRefSentinel(id).length
        if (remaining <= slen) {
          selection.removeAllRanges()
          const r = document.createRange()
          r.setStartAfter(el)
          r.collapse(true)
          selection.addRange(r)
          return true
        }
        remaining -= slen
        return false
      }
      for (const c of n.childNodes) {
        if (walk(c)) return true
      }
    }
    return false
  }

  for (const c of root.childNodes) {
    if (walk(c)) return
  }
  selection.removeAllRanges()
  const r = document.createRange()
  r.selectNodeContents(root)
  r.collapse(false)
  selection.addRange(r)
}

const SPLIT_RE =
  /(\[\[canvas-ref:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\]\])/gi

export function fillEditorFromSerialized(
  root: HTMLElement,
  serialized: string,
  labelForId: (id: string) => string,
  onRemoveId: (id: string) => void,
  chipClassName: string = CANVAS_HTML_PROMPT_CHIP_CLASS,
): void {
  root.replaceChildren()
  const parts = serialized.split(SPLIT_RE).filter(Boolean)
  for (const part of parts) {
    const m = /^\[\[canvas-ref:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]\]$/i.exec(
      part,
    )
    if (m) {
      const id = m[1]!
      const wrap = document.createElement('span')
      wrap.dataset.canvasRefId = id
      wrap.setAttribute('contenteditable', 'false')
      wrap.className = chipClassName
      wrap.setAttribute('role', 'group')
      wrap.setAttribute('aria-label', `Canvas reference: ${labelForId(id)}`)

      const lab = document.createElement('span')
      lab.className = 'min-w-0 truncate'
      lab.textContent = labelForId(id)

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.dataset.removeRef = '1'
      btn.className =
        'inline-flex size-3 shrink-0 items-center justify-center rounded p-0 text-[11px] leading-none hover:bg-brandcolor-white/60 focus:outline-none'
      btn.setAttribute('aria-label', `Remove reference ${labelForId(id)}`)
      btn.textContent = '×'
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault()
        e.stopPropagation()
        onRemoveId(id)
      })

      wrap.appendChild(lab)
      wrap.appendChild(btn)
      root.appendChild(wrap)
    } else if (part) {
      root.appendChild(document.createTextNode(part))
    }
  }
}

export function insertSentinelAtSerializedCaret(
  serialized: string,
  caretSerialized: number,
  sentinel: string,
): string {
  const i = Math.max(0, Math.min(caretSerialized, serialized.length))
  return `${serialized.slice(0, i)}${sentinel}${serialized.slice(i)}`
}
