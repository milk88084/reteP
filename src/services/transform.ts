import { Food, FoodEntry } from '@/types'

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

/** Seed values for the manual-entry form when picking a food from the library.
 *  No id/logged_at — the modal assigns those when the user confirms. Nutrition
 *  is copied as-is (per the food's serving_size); the user adjusts in the form. */
export const foodToPrefill = (food: Food): Partial<FoodEntry> => ({
  food_name: food.name,
  food_name_en: food.name_en ?? undefined,
  serving_size: food.serving_size,
  calories: food.calories,
  protein: food.protein,
  carbs: food.carbs,
  fat: food.fat,
  fiber: food.fiber,
})
