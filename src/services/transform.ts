import { FoodEntry } from '@/types'

/** Backend GET /logs/range returns one object per date. Flatten into the
 *  { [date]: entries } shape the food-log store uses. */
export interface DailyLogResponse {
  date: string
  entries: FoodEntry[]
}

export const groupDailyLogs = (
  days: DailyLogResponse[],
): Record<string, FoodEntry[]> => {
  const grouped: Record<string, FoodEntry[]> = {}
  for (const day of days) {
    grouped[day.date] = day.entries
  }
  return grouped
}
