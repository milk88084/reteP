import { useEffect } from 'react'
import { useSession } from '@clerk/clerk-react'
import { setApiTokenGetter } from '@/lib/apiClient'

/**
 * Registers a Clerk token getter into the API client on session change.
 * Uses the default Clerk session JWT (verifiable by the backend via JWKS).
 * Renders nothing — side-effects only.
 */
export const ApiAuthSync = () => {
  const { session } = useSession()

  useEffect(() => {
    if (!session) {
      setApiTokenGetter(null)
      return
    }
    setApiTokenGetter(() => session.getToken())
    return () => { setApiTokenGetter(null) }
  }, [session?.id])

  return null
}
