import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/constants'

interface SettingsState {
  settings: UserSettings
  updateSettings: (partial: Partial<UserSettings>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_SETTINGS },
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    { name: 'diet_settings' }
  )
)
