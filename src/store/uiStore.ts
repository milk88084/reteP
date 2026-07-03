import { create } from 'zustand'
import { FoodEntry } from '@/types'

interface UIState {
  showManualEntry: boolean
  showFoodLibrary: boolean
  pendingCamera: boolean
  /** Seed values for the manual-entry form (set when a food is picked from the library). */
  prefillEntry: Partial<FoodEntry> | null
  setShowManualEntry: (v: boolean) => void
  setShowFoodLibrary: (v: boolean) => void
  setPrefillEntry: (e: Partial<FoodEntry> | null) => void
  triggerCamera: () => void
  clearCamera: () => void
}

export const useUIStore = create<UIState>((set) => ({
  showManualEntry: false,
  showFoodLibrary: false,
  pendingCamera: false,
  prefillEntry: null,
  setShowManualEntry: (v) => set({ showManualEntry: v }),
  setShowFoodLibrary: (v) => set({ showFoodLibrary: v }),
  setPrefillEntry: (e) => set({ prefillEntry: e }),
  triggerCamera: () => set({ pendingCamera: true }),
  clearCamera: () => set({ pendingCamera: false }),
}))
