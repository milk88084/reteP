import { FoodEntry, DailyLog, DailySummary, RecognizeResponse, RecognizeApiResult } from '@/types'
import { MOCK_FOODS } from '@/constants'
import { sumEntries } from '@/utils/nutritionCalc'

const STORAGE_KEY = 'diet_tracker_logs'
let mockFoodIndex = 0

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const readStorage = (): Record<string, FoodEntry[]> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeStorage = (data: Record<string, FoodEntry[]>): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockRecognizeFood = async (file: File): Promise<RecognizeResponse> => {
  await delay(1800)
  const food = MOCK_FOODS[mockFoodIndex % MOCK_FOODS.length]
  mockFoodIndex++
  const result: RecognizeApiResult = {
    id: generateId(),
    ...food,
    food_name_en: food.food_name_en,
    recognized_at: new Date().toISOString(),
  }
  return { success: true, data: result }
}

export const mockGetLogs = async (date: string): Promise<DailyLog> => {
  await delay(300)
  const storage = readStorage()
  const entries = storage[date] ?? []
  const summary: DailySummary = {
    ...sumEntries(entries),
  }
  return { date, entries, summary }
}

export const mockDeleteEntry = async (entryId: string, date: string): Promise<void> => {
  await delay(200)
  const storage = readStorage()
  if (storage[date]) {
    storage[date] = storage[date].filter((e) => e.id !== entryId)
    writeStorage(storage)
  }
}

export const mockSaveEntry = async (entry: FoodEntry, date: string): Promise<void> => {
  await delay(200)
  const storage = readStorage()
  if (!storage[date]) storage[date] = []
  storage[date] = [entry, ...storage[date]]
  writeStorage(storage)
}
