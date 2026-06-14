import { create } from 'zustand'

interface UIState {
  showManualEntry: boolean
  pendingCamera: boolean
  setShowManualEntry: (v: boolean) => void
  triggerCamera: () => void
  clearCamera: () => void
}

export const useUIStore = create<UIState>((set) => ({
  showManualEntry: false,
  pendingCamera: false,
  setShowManualEntry: (v) => set({ showManualEntry: v }),
  triggerCamera: () => set({ pendingCamera: true }),
  clearCamera: () => set({ pendingCamera: false }),
}))
