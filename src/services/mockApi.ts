import { Food, FoodEntry, DailyLog, DailySummary, RecognizeResponse, RecognizeApiResult, UserSettings } from '@/types'
import { MOCK_FOODS } from '@/constants'
import { sumEntries } from '@/utils/nutritionCalc'
import { newId } from '@/utils/id'

const STORAGE_KEY = 'diet_tracker_logs'
const SETTINGS_KEY = 'diet_tracker_settings'
let mockFoodIndex = 0

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

export const mockRecognizeFood = async (_file: File): Promise<RecognizeResponse> => {
  await delay(1800)
  const food = MOCK_FOODS[mockFoodIndex % MOCK_FOODS.length]
  mockFoodIndex++
  const result: RecognizeApiResult = {
    id: newId(),
    ...food,
    food_name_en: food.food_name_en,
    recognized_at: new Date().toISOString(),
  }
  return { success: true, data: result }
}

const MOCK_LIBRARY: Food[] = MOCK_FOODS.map((f, i) => ({
  id: `mock-food-${i}`,
  name: f.food_name,
  name_en: f.food_name_en ?? null,
  category: null,
  calories: f.calories,
  protein: f.protein,
  carbs: f.carbs,
  fat: f.fat,
  fiber: f.fiber,
  serving_size: f.serving_size,
  owner_id: null,
  source: 'system',
}))

export const mockSearchFoods = async (search?: string): Promise<Food[]> => {
  await delay(200)
  const q = search?.trim().toLowerCase()
  if (!q) return MOCK_LIBRARY.slice(0, 50)
  return MOCK_LIBRARY.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 50)
}

export const mockGetLogs = async (date: string): Promise<DailyLog> => {
  await delay(300)
  const storage = readStorage()
  const entries = storage[date] ?? []
  const summary: DailySummary = { ...sumEntries(entries) }
  return { date, entries, summary }
}

export const mockGetLogsRange = async (
  from: string,
  to: string,
): Promise<Record<string, FoodEntry[]>> => {
  await delay(300)
  const storage = readStorage()
  const result: Record<string, FoodEntry[]> = {}
  for (const [date, entries] of Object.entries(storage)) {
    if (date >= from && date <= to) result[date] = entries
  }
  return result
}

export const mockSaveEntry = async (entry: FoodEntry, date: string): Promise<void> => {
  await delay(200)
  const storage = readStorage()
  if (!storage[date]) storage[date] = []
  storage[date] = [entry, ...storage[date]]
  writeStorage(storage)
}

export const mockUpdateEntry = async (entry: FoodEntry): Promise<void> => {
  await delay(200)
  const storage = readStorage()
  for (const date of Object.keys(storage)) {
    storage[date] = storage[date].map((e) => (e.id === entry.id ? entry : e))
  }
  writeStorage(storage)
}

export const mockDeleteEntry = async (entryId: string): Promise<void> => {
  await delay(200)
  const storage = readStorage()
  for (const date of Object.keys(storage)) {
    storage[date] = storage[date].filter((e) => e.id !== entryId)
  }
  writeStorage(storage)
}

export const mockGetSettings = async (): Promise<UserSettings | null> => {
  await delay(100)
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? (JSON.parse(raw) as UserSettings) : null
  } catch {
    return null
  }
}

export const mockPutSettings = async (settings: UserSettings): Promise<void> => {
  await delay(100)
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
