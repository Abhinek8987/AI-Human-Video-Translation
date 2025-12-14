import { RouteObject, useRoutes, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Upload from './pages/Upload'
import Status from './pages/Status'
import PreviewDownload from './pages/PreviewDownload'
import Dashboard from './pages/Dashboard'
import HelpPage from './pages/HelpPage'

const routes: RouteObject[] = [
  { path: '/', element: <Auth /> },
  { path: '/upload', element: <Upload /> },
  { path: '/status/:jobId', element: <Status /> },
  { path: '/preview/:jobId', element: <PreviewDownload /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/help', element: <HelpPage /> },
  { path: '*', element: <Navigate to="/upload" replace /> },
]

export default function AppRoutes() {
  const element = useRoutes(routes)
  return element
}
