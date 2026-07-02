import axios from 'axios'
import { RecognizeResponse, DailyLog, FoodEntry, UserSettings } from '@/types'
import {
  mockRecognizeFood,
  mockGetLogs,
  mockGetLogsRange,
  mockSaveEntry,
  mockUpdateEntry,
  mockDeleteEntry,
  mockGetSettings,
  mockPutSettings,
} from './mockApi'
import { apiClient } from '@/lib/apiClient'
import { groupDailyLogs, DailyLogResponse } from './transform'
import { newId } from '@/utils/id'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

interface N8nFoodResponse {
  FoodName: string
  Calories: number
  Protein: number
  Fat: number
  Carbs: number
  Details: string
}

// ── AI 拍照辨識（維持直接打 n8n，不經後端）─────────────────────────
export const recognizeFood = async (file: File, description?: string): Promise<RecognizeResponse> => {
  if (USE_MOCK) return mockRecognizeFood(file)

  const webhookUrl = import.meta.env.VITE_AI_WEBHOOK_URL as string | undefined
  if (!webhookUrl) return mockRecognizeFood(file)

  const form = new FormData()
  form.append('image', file)
  if (description?.trim()) form.append('description', description.trim())
  const res = await fetch(webhookUrl, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`AI webhook error: ${res.status}`)

  const raw: N8nFoodResponse = await res.json()

  if (raw.FoodName === '解析失敗') {
    return { success: false, error: raw.Details || '食物辨識失敗' }
  }

  return {
    success: true,
    data: {
      id: newId(),
      food_name: raw.FoodName,
      calories: raw.Calories,
      protein: raw.Protein,
      fat: raw.Fat,
      carbs: raw.Carbs,
      fiber: 0,
      serving_size: '1份',
      confidence: 1.0,
      recognized_at: new Date().toISOString(),
    },
  }
}

// ── 資料層：全部改打後端 ────────────────────────────────────────────
const toLogPayload = (entry: FoodEntry) => ({
  food_name: entry.food_name,
  calories: entry.calories,
  protein: entry.protein,
  carbs: entry.carbs,
  fat: entry.fat,
  fiber: entry.fiber,
  serving_size: entry.serving_size,
  emoji: entry.emoji ?? null,
})

export const getDailyLog = async (date: string): Promise<DailyLog> => {
  if (USE_MOCK) return mockGetLogs(date)
  const { data } = await apiClient.get<DailyLog>('/logs', { params: { date } })
  return data
}

export const getLogsRange = async (
  from: string,
  to: string,
): Promise<Record<string, FoodEntry[]>> => {
  if (USE_MOCK) return mockGetLogsRange(from, to)
  const { data } = await apiClient.get<DailyLogResponse[]>('/logs/range', {
    params: { from, to },
  })
  return groupDailyLogs(data)
}

export const saveEntry = async (entry: FoodEntry, date: string): Promise<void> => {
  if (USE_MOCK) return mockSaveEntry(entry, date)
  await apiClient.post('/logs', { id: entry.id, date, ...toLogPayload(entry) })
}

export const updateEntry = async (entry: FoodEntry): Promise<void> => {
  if (USE_MOCK) return mockUpdateEntry(entry)
  await apiClient.patch(`/logs/${entry.id}`, toLogPayload(entry))
}

export const deleteEntry = async (entryId: string): Promise<void> => {
  if (USE_MOCK) return mockDeleteEntry(entryId)
  await apiClient.delete(`/logs/${entryId}`)
}

/** Returns the user's settings, or null if they have never configured them. */
export const getSettings = async (): Promise<UserSettings | null> => {
  if (USE_MOCK) return mockGetSettings()
  try {
    const { data } = await apiClient.get<UserSettings>('/settings')
    return data
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null
    throw e
  }
}

export const putSettings = async (settings: UserSettings): Promise<void> => {
  if (USE_MOCK) return mockPutSettings(settings)
  await apiClient.put('/settings', settings)
}
