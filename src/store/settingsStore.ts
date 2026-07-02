import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/constants'
import { putSettings } from '@/services/foodRecognitionApi'

interface SettingsState {
  settings: UserSettings
  isConfigured: boolean
  updateSettings: (partial: Partial<UserSettings>) => void
  setSettings:    (settings: UserSettings) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: { ...DEFAULT_SETTINGS },
      isConfigured: false,

      // Called when we load real settings from the backend.
      setSettings: (settings) => set({ settings, isConfigured: true }),

      updateSettings: (partial) => {
        const merged = { ...get().settings, ...partial }
        set({ settings: merged, isConfigured: true })

        putSettings(merged).catch((e) =>
          console.error('[updateSettings] API error:', e),
        )
      },
    }),
    { name: 'diet_settings_v2' }
  )
)
