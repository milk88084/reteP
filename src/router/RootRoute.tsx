import { useAuth } from '@/hooks/useAuth'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { resolveRootRoute } from './resolveRootRoute'

const Spinner = () => (
  <div className="fixed inset-0 bg-bg flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-ink/20 border-t-ink rounded-full animate-spin" />
  </div>
)

/** Synchronous hint that a Clerk session likely exists (cookie set, not signed out). */
const hasClerkSession = (): boolean => {
  if (typeof document === 'undefined') return false
  return document.cookie.split('; ').some((c) => {
    const [key, value] = c.split('=')
    return (key === '__client_uat' && value !== '0') || key === '__session'
  })
}

/** `/` — landing page for signed-out visitors, the app itself for signed-in users. */
export const RootRoute = () => {
  const { isLoaded, isSignedIn } = useAuth()

  switch (resolveRootRoute(isLoaded, isSignedIn, hasClerkSession())) {
    case 'loading':
      return <Spinner />
    case 'app':
      return <AppShell />
    case 'landing':
      return <LandingPage />
  }
}
