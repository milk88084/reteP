import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useFoodLogStore } from '@/store/foodLogStore'
import { useSettingsStore } from '@/store/settingsStore'
import { supabase } from '@/lib/supabase'
import { FoodEntry } from '@/types'

/**
 * Loads the user's data from Supabase once per login and hydrates Zustand stores.
 * Renders nothing — side-effects only.
 */
export const DataSync = () => {
  const { isSignedIn, user } = useAuth()
  const { setLogs } = useFoodLogStore()
  const { setSettings } = useSettingsStore()

  useEffect(() => {
    if (!isSignedIn || !user) return

    // Load last 60 days of food logs
    const since = new Date()
    since.setDate(since.getDate() - 60)
    const sinceStr = since.toISOString().slice(0, 10)

    supabase.from('food_logs')
      .select('date, entry')
      .eq('user_id', user.id)
      .gte('date', sinceStr)
      .then(({ data, error }) => {
        if (error || !data) return
        const grouped: Record<string, FoodEntry[]> = {}
        for (const row of data) {
          grouped[row.date] = [...(grouped[row.date] ?? []), row.entry as FoodEntry]
        }
        setLogs(grouped)
      })

    // Load user settings
    supabase.from('user_settings')
      .select('settings')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data?.settings) return
        setSettings(data.settings)
      })
  }, [user?.id, isSignedIn])

  return null
}
