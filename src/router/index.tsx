import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'

export const router = createBrowserRouter([
  { path: '/login',        element: <LoginPage /> },
  { path: '/sso-callback', element: <AuthCallbackPage /> },
  { path: '/*',            element: <AppShell /> },
])
