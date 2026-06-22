import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/constants'
import { supabase } from '@/lib/supabase'

interface SettingsState {
  settings: UserSettings
  isConfigured: boolean
  updateSettings: (partial: Partial<UserSettings>, userId?: string) => void
  setSettings:    (settings: UserSettings) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: { ...DEFAULT_SETTINGS },
      isConfigured: false,

      setSettings: (settings) => set({ settings }),

      updateSettings: (partial, userId) => {
        set((state) => ({ settings: { ...state.settings, ...partial }, isConfigured: true }))

        if (userId) {
          const merged = { ...get().settings, ...partial }
          supabase
            .from('user_settings')
            .upsert({ user_id: userId, settings: merged }, { onConflict: 'user_id' })
            .then(({ error }) => {
              if (error) console.error('[updateSettings] Supabase error:', error)
            })
        }
      },
    }),
    { name: 'diet_settings_v2' }
  )
)
