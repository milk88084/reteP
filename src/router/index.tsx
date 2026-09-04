import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { SupportPage } from '@/pages/SupportPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { AboutPage } from '@/pages/AboutPage'
import { RootRoute } from './RootRoute'

export const router = createBrowserRouter([
  { path: '/',             element: <RootRoute /> },
  { path: '/login',        element: <LoginPage /> },
  { path: '/support',      element: <SupportPage /> },
  { path: '/privacy',      element: <PrivacyPage /> },
  { path: '/about',        element: <AboutPage /> },
  { path: '/sso-callback', element: <AuthCallbackPage /> },
  { path: '/*',            element: <AppShell /> },
])
