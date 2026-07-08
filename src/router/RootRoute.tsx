import { useAuth } from '@/hooks/useAuth'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { resolveRootRoute } from './resolveRootRoute'

const Spinner = () => (
  <div className="fixed inset-0 bg-bg flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-ink/20 border-t-ink rounded-full animate-spin" />
  </div>
)

/** `/` — landing page for signed-out visitors, the app itself for signed-in users. */
export const RootRoute = () => {
  const { isLoaded, isSignedIn } = useAuth()

  switch (resolveRootRoute(isLoaded, isSignedIn)) {
    case 'loading':
      return <Spinner />
    case 'app':
      return <AppShell />
    case 'landing':
      return <LandingPage />
  }
}
