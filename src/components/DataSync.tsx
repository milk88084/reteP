import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useFoodLogStore } from '@/store/foodLogStore'
import { getLogsRange } from '@/services/foodRecognitionApi'

/**
 * Loads the user's last 60 days of food logs from the backend once per login
 * and hydrates the food-log store. Settings are loaded by AppShell (it needs
 * the configured/not-configured distinction for first-sign-in gating).
 * Renders nothing — side-effects only.
 */
export const DataSync = () => {
  const { isSignedIn, user } = useAuth()
  const { setLogs } = useFoodLogStore()

  useEffect(() => {
    if (!isSignedIn || !user) return

    const since = new Date()
    since.setDate(since.getDate() - 60)
    const from = since.toISOString().slice(0, 10)
    const to = new Date().toISOString().slice(0, 10)

    getLogsRange(from, to)
      .then(setLogs)
      .catch((e) => console.error('[DataSync]', e))
  }, [user?.id, isSignedIn])

  return null
}
