import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FoodEntry, DailySummary } from '@/types'
import { sumEntries } from '@/utils/nutritionCalc'
import { getTodayStr } from '@/utils/dateUtils'

const TODAY = getTodayStr()

const MOCK_ENTRIES: FoodEntry[] = [
  {
    id: 'mock-1',
    food_name: '燕麥粥',
    food_name_en: 'Oatmeal',
    calories: 320,
    protein: 10,
    carbs: 54,
    fat: 6,
    fiber: 4,
    serving_size: '1 碗 (250g)',
    confidence: 0.95,
    logged_at: `${TODAY}T07:30:00.000Z`,
  },
  {
    id: 'mock-2',
    food_name: '水煮雞胸肉',
    food_name_en: 'Boiled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    serving_size: '1 份 (100g)',
    confidence: 0.92,
    logged_at: `${TODAY}T12:15:00.000Z`,
  },
  {
    id: 'mock-3',
    food_name: '蔬菜炒飯',
    food_name_en: 'Vegetable Fried Rice',
    calories: 480,
    protein: 12,
    carbs: 72,
    fat: 14,
    fiber: 3,
    serving_size: '1 份 (300g)',
    confidence: 0.88,
    logged_at: `${TODAY}T12:20:00.000Z`,
  },
  {
    id: 'mock-4',
    food_name: '香蕉',
    food_name_en: 'Banana',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    serving_size: '1 根 (中型)',
    confidence: 0.98,
    logged_at: `${TODAY}T15:00:00.000Z`,
  },
]

interface FoodLogState {
  logs: Record<string, FoodEntry[]>
  addEntry: (date: string, entry: FoodEntry) => void
  removeEntry: (date: string, entryId: string) => void
  getEntriesForDate: (date: string) => FoodEntry[]
  getDailySummary: (date: string) => DailySummary
}

export const useFoodLogStore = create<FoodLogState>()(
  persist(
    (set, get) => ({
      logs: { [TODAY]: MOCK_ENTRIES },

      addEntry: (date, entry) =>
        set((state) => ({
          logs: {
            ...state.logs,
            [date]: [entry, ...(state.logs[date] ?? [])],
          },
        })),

      removeEntry: (date, entryId) =>
        set((state) => ({
          logs: {
            ...state.logs,
            [date]: (state.logs[date] ?? []).filter((e) => e.id !== entryId),
          },
        })),

      getEntriesForDate: (date) => get().logs[date] ?? [],

      getDailySummary: (date): DailySummary => {
        const entries = get().logs[date] ?? []
        return sumEntries(entries)
      },
    }),
    { name: 'diet_logs' }
  )
)
