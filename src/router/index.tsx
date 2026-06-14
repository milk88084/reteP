import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/*',    element: <AppShell /> },
])
