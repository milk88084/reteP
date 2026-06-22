import { RecognizeResponse, DailyLog, FoodEntry } from '@/types'
import { mockRecognizeFood, mockGetLogs, mockDeleteEntry, mockSaveEntry } from './mockApi'
import { supabase } from '@/lib/supabase'
import { sumEntries } from '@/utils/nutritionCalc'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

interface N8nFoodResponse {
  FoodName: string
  Calories: number
  Protein: number
  Fat: number
  Carbs: number
  Details: string
}

export const recognizeFood = async (file: File): Promise<RecognizeResponse> => {
  if (USE_MOCK) return mockRecognizeFood(file)

  const webhookUrl = import.meta.env.VITE_AI_WEBHOOK_URL as string | undefined
  if (!webhookUrl) return mockRecognizeFood(file)

  const form = new FormData()
  form.append('image', file)
  const res = await fetch(webhookUrl, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`AI webhook error: ${res.status}`)

  const raw: N8nFoodResponse = await res.json()

  if (raw.FoodName === '解析失敗') {
    return { success: false, error: raw.Details || '食物辨識失敗' }
  }

  return {
    success: true,
    data: {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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

export const getDailyLog = async (date: string, userId: string): Promise<DailyLog> => {
  if (USE_MOCK) return mockGetLogs(date)

  const { data, error } = await supabase
    .from('food_logs')
    .select('entry')
    .eq('user_id', userId)
    .eq('date', date)

  if (error) throw error
  const entries = (data ?? []).map((r) => r.entry as FoodEntry)
  return { date, entries, summary: sumEntries(entries) }
}

export const saveEntry = async (entry: FoodEntry, date: string, userId: string): Promise<void> => {
  if (USE_MOCK) return mockSaveEntry(entry, date)

  const { error } = await supabase
    .from('food_logs')
    .insert({ user_id: userId, date, entry })

  if (error) throw error
}

export const updateEntry = async (entry: FoodEntry, date: string, userId: string): Promise<void> => {
  if (USE_MOCK) return

  const { error } = await supabase
    .from('food_logs')
    .update({ entry })
    .eq('user_id', userId)
    .eq('date', date)
    .eq('entry->>id', entry.id)

  if (error) throw error
}

export const deleteEntry = async (entryId: string, date: string, userId: string): Promise<void> => {
  if (USE_MOCK) return mockDeleteEntry(entryId, date)

  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('user_id', userId)
    .eq('date', date)
    .eq('entry->>id', entryId)

  if (error) throw error
}
