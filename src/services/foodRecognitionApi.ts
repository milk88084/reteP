import { RecognizeResponse, DailyLog, FoodEntry } from '@/types'
import { mockRecognizeFood, mockGetLogs, mockDeleteEntry, mockSaveEntry } from './mockApi'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.DEV

export const recognizeFood = async (file: File): Promise<RecognizeResponse> => {
  if (USE_MOCK) return mockRecognizeFood(file)
  // Real API:
  // const form = new FormData()
  // form.append('image', file)
  // const { data } = await httpClient.post<RecognizeResponse>('/food/recognize', form, {
  //   headers: { 'Content-Type': 'multipart/form-data' }
  // })
  // return data
  throw new Error('Real API not configured. Set VITE_USE_MOCK=true or implement.')
}

export const getDailyLog = async (date: string): Promise<DailyLog> => {
  if (USE_MOCK) return mockGetLogs(date)
  // const { data } = await httpClient.get<{ success: boolean; data: DailyLog }>('/food/logs', { params: { date } })
  // return data.data
  throw new Error('Real API not configured.')
}

export const deleteEntry = async (entryId: string, date: string): Promise<void> => {
  if (USE_MOCK) return mockDeleteEntry(entryId, date)
  // await httpClient.delete(`/food/logs/${entryId}`)
  throw new Error('Real API not configured.')
}

export const saveEntry = async (entry: FoodEntry, date: string): Promise<void> => {
  if (USE_MOCK) return mockSaveEntry(entry, date)
  // n8n webhook — adjust to your payload format:
  // await httpClient.post('/food/logs', { ...entry, date })
  // OR for n8n: await axios.post(import.meta.env.VITE_N8N_WEBHOOK_URL, { ...entry, date })
  throw new Error('Real API not configured.')
}
