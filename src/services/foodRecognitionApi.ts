import { RecognizeResponse, DailyLog, FoodEntry } from '@/types'
import { mockRecognizeFood, mockGetLogs, mockDeleteEntry, mockSaveEntry } from './mockApi'
import { getAuthedSupabase } from '@/lib/supabase'
import { sumEntries } from '@/utils/nutritionCalc'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Food recognition still calls an external AI service (n8n webhook or similar).
// Set VITE_AI_WEBHOOK_URL in .env.local to enable real recognition.
export const recognizeFood = async (file: File): Promise<RecognizeResponse> => {
  if (USE_MOCK) return mockRecognizeFood(file)

  const webhookUrl = import.meta.env.VITE_AI_WEBHOOK_URL as string | undefined
  if (!webhookUrl) return mockRecognizeFood(file) // graceful fallback while webhook not set

  const form = new FormData()
  form.append('image', file)
  const res = await fetch(webhookUrl, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`AI webhook error: ${res.status}`)
  return res.json() as Promise<RecognizeResponse>
}

export const getDailyLog = async (date: string, userId: string): Promise<DailyLog> => {
  if (USE_MOCK) return mockGetLogs(date)

  const { data, error } = await getAuthedSupabase()
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

  const { error } = await getAuthedSupabase()
    .from('food_logs')
    .insert({ user_id: userId, date, entry })

  if (error) throw error
}

export const deleteEntry = async (entryId: string, date: string, userId: string): Promise<void> => {
  if (USE_MOCK) return mockDeleteEntry(entryId, date)

  const { error } = await getAuthedSupabase()
    .from('food_logs')
    .delete()
    .eq('user_id', userId)
    .eq('date', date)
    .eq('entry->>id', entryId)

  if (error) throw error
}
