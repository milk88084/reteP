import { useEffect } from 'react'
import { useSession } from '@clerk/clerk-react'
import { createAuthedClient, setAuthedSupabase } from '@/lib/supabase'

/**
 * Keeps the module-level Supabase client in sync with the Clerk JWT.
 * Must be rendered inside ClerkProvider and re-renders on session change.
 */
export const SupabaseAuthSync = () => {
  const { session } = useSession()

  useEffect(() => {
    if (!session) return

    session.getToken({ template: 'supabase' }).then((token) => {
      if (token) setAuthedSupabase(createAuthedClient(token))
    })
  }, [session?.id, session?.lastActiveToken])

  return null
}
