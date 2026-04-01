import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import {
  ADMIN_CANVAS_STORAGE_KEY,
  type CanvasElement,
} from '../types/canvas'

const DEFAULT_ELEMENTS: CanvasElement[] = [
  {
    id: '1',
    x: 48,
    y: 48,
    title: 'Card A',
    width: 200,
    height: 120,
  },
  {
    id: '2',
    x: 280,
    y: 96,
    title: 'Card B',
    width: 200,
    height: 120,
  },
]

function loadElements(): CanvasElement[] {
  try {
    const raw = localStorage.getItem(ADMIN_CANVAS_STORAGE_KEY)
    if (!raw) return DEFAULT_ELEMENTS
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return DEFAULT_ELEMENTS
    return parsed as CanvasElement[]
  } catch {
    return DEFAULT_ELEMENTS
  }
}

function saveElements(elements: CanvasElement[]) {
  localStorage.setItem(ADMIN_CANVAS_STORAGE_KEY, JSON.stringify(elements))
}

export function AdminCanvasPage() {
  const [elements, setElements] = useState<CanvasElement[]>(loadElements)
  const dragRef = useRef<{
    id: string
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveElements(elements)
  }, [elements])

  const onPointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (e.button !== 0) return
      const el = elements.find((x) => x.id === id)
      if (!el) return
      e.currentTarget.setPointerCapture(e.pointerId)
      dragRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        originX: el.x,
        originY: el.y,
      }
    },
    [elements],
  )

  const onPointerMoveFor = useCallback(
    (id: string, e: React.PointerEvent) => {
      const d = dragRef.current
      if (!d || d.id !== id) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      setElements((prev) =>
        prev.map((item) =>
          item.id === d.id
            ? { ...item, x: d.originX + dx, y: d.originY + dy }
            : item,
        ),
      )
    },
    [],
  )

  const endDragFor = useCallback(
    (id: string, e: React.PointerEvent) => {
      const d = dragRef.current
      if (!d || d.id !== id) return
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      dragRef.current = null
    },
    [],
  )

  const addCard = useCallback(() => {
    setElements((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        x: 80 + prev.length * 24,
        y: 80 + prev.length * 24,
        title: `Card ${prev.length + 1}`,
        width: 200,
        height: 120,
      },
    ])
  }, [])

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(elements, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'canvas-elements.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [elements])

  const onImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      file
        .text()
        .then((text) => {
          const data = JSON.parse(text) as CanvasElement[]
          if (!Array.isArray(data)) throw new Error('Invalid format')
          setElements(data)
        })
        .catch(() => {
          /* invalid file */
        })
      e.target.value = ''
    },
    [],
  )

  return (
    <div className="flex min-h-screen flex-col bg-brandcolor-fill">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-brandcolor-strokeweak bg-brandcolor-white px-4 py-3 shadow-header">
        <div className="flex items-center gap-3">
          <Link
            to="/catalog/home"
            className="text-sm font-medium text-brandcolor-secondary hover:text-brandcolor-secondaryhover"
          >
            ← Catalog
          </Link>
          <h1 className="font-sans text-lg font-semibold text-brandcolor-textstrong">
            Admin canvas
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="neutral" onClick={addCard}>
            Add card
          </Button>
          <Button type="button" variant="neutral" onClick={exportJson}>
            Export JSON
          </Button>
          <Button
            type="button"
            variant="neutral"
            onClick={() => fileInputRef.current?.click()}
          >
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImportFile}
          />
        </div>
      </header>
      <div className="relative flex-1 overflow-hidden">
        <p className="absolute left-4 top-4 z-0 max-w-md text-xs text-brandcolor-textweak">
          Drag cards to arrange. State syncs to localStorage (
          <code className="text-brandcolor-textstrong">
            {ADMIN_CANVAS_STORAGE_KEY}
          </code>
          ).
        </p>
        {elements.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            className="absolute cursor-grab select-none rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white p-3 shadow-card active:cursor-grabbing"
            style={{
              left: item.x,
              top: item.y,
              width: item.width,
              minHeight: item.height,
            }}
            onPointerDown={(e) => onPointerDown(e, item.id)}
            onPointerMove={(e) => onPointerMoveFor(item.id, e)}
            onPointerUp={(e) => endDragFor(item.id, e)}
            onPointerCancel={(e) => endDragFor(item.id, e)}
          >
            <p className="text-sm font-semibold text-brandcolor-textstrong">
              {item.title}
            </p>
            <p className="mt-2 text-xs text-brandcolor-textweak">
              Drag to move · persisted locally
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
