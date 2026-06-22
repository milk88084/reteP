import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FoodEntry, DailySummary } from '@/types'
import { sumEntries } from '@/utils/nutritionCalc'

interface FoodLogState {
  logs: Record<string, FoodEntry[]>
  addEntry:    (date: string, entry: FoodEntry) => void
  removeEntry: (date: string, entryId: string) => void
  updateEntry: (date: string, entry: FoodEntry) => void
  setLogs:     (logs: Record<string, FoodEntry[]>) => void
  getEntriesForDate: (date: string) => FoodEntry[]
  getDailySummary:   (date: string) => DailySummary
}

export const useFoodLogStore = create<FoodLogState>()(
  persist(
    (set, get) => ({
      logs: {},

      addEntry: (date, entry) =>
        set((state) => ({
          logs: { ...state.logs, [date]: [entry, ...(state.logs[date] ?? [])] },
        })),

      removeEntry: (date, entryId) =>
        set((state) => ({
          logs: {
            ...state.logs,
            [date]: (state.logs[date] ?? []).filter((e) => e.id !== entryId),
          },
        })),

      updateEntry: (date, entry) =>
        set((state) => ({
          logs: {
            ...state.logs,
            [date]: (state.logs[date] ?? []).map((e) => e.id === entry.id ? entry : e),
          },
        })),

      setLogs: (logs) => set({ logs }),

      getEntriesForDate: (date) => get().logs[date] ?? [],

      getDailySummary: (date): DailySummary => {
        const entries = get().logs[date] ?? []
        return sumEntries(entries)
      },
    }),
    { name: 'diet_logs_v2' }
  )
)
