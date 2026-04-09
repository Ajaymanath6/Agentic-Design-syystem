import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import ComponentsCanvasSurface from '../components/canvas/ComponentsCanvasSurface'
import { ComponentsCanvasAiProvider } from '../context/ComponentsCanvasAiContext'
import { LayoutWorkspacePage } from './LayoutWorkspacePage'

function AdminCanvasOutletInner() {
  const [searchParams] = useSearchParams()
  const view = searchParams.get('view') === 'layout' ? 'layout' : 'components'
  return view === 'layout' ? (
    <LayoutWorkspacePage />
  ) : (
    <ComponentsCanvasAiProvider>
      <ComponentsCanvasSurface />
    </ComponentsCanvasAiProvider>
  )
}

/** `/admin/canvas` — Components vs Layout via `?view=layout` or default components. */
export function AdminCanvasOutlet() {
  return (
    <Suspense fallback={null}>
      <AdminCanvasOutletInner />
    </Suspense>
  )
}
