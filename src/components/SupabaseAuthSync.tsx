import { useEffect } from 'react'
import { useSession } from '@clerk/clerk-react'
import { setTokenGetter } from '@/lib/supabase'

export const SupabaseAuthSync = () => {
  const { session } = useSession()

  useEffect(() => {
    if (!session) {
      setTokenGetter(null)
      return
    }
    setTokenGetter(() => session.getToken({ template: 'supabase' }))
    return () => { setTokenGetter(null) }
  }, [session?.id])

  return null
}
