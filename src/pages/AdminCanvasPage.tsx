import { useAdminWorkspace } from '../context/AdminWorkspaceContext'
import { AdminLayoutStudio } from './admin/AdminLayoutStudio'
import { AdminCanvasStage } from './admin/AdminCanvasStage'

export function AdminCanvasPage() {
  const { mode } = useAdminWorkspace()
  if (mode === 'layout') {
    return <AdminLayoutStudio />
  }
  return <AdminCanvasStage />
}
