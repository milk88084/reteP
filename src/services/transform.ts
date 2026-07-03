import { Food, FoodEntry, FoodSuggestion, NutritionInfo } from '@/types'

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

export interface PortionView extends NutritionInfo {
  /** Short label for the portion, e.g. "1碗" or "每100g". */
  label: string
  /** Serving description for the log entry, e.g. "1碗（200g）" or "每100g". */
  serving_size: string
}

type PortionSource = NutritionInfo & {
  portion_label?: string | null
  portion_grams?: number | null
}

const round1 = (n: number): number => Math.round(n * 10) / 10

/** Resolve a food/suggestion to what should be shown and logged for one portion.
 *  If it carries a portion (label + grams > 0), nutrition is scaled from the
 *  per-100g base to that portion; otherwise the per-100g values pass through. */
export const portionView = (item: PortionSource): PortionView => {
  const g = item.portion_grams
  if (g && g > 0 && item.portion_label) {
    const k = g / 100
    return {
      label: `1${item.portion_label}`,
      serving_size: `1${item.portion_label}（${g}g）`,
      calories: round1(item.calories * k),
      protein: round1(item.protein * k),
      carbs: round1(item.carbs * k),
      fat: round1(item.fat * k),
      fiber: round1(item.fiber * k),
    }
  }
  return {
    label: '每100g',
    serving_size: '每100g',
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    fiber: item.fiber,
  }
}

/** Seed values for the manual-entry form when picking a food from the library.
 *  No id/logged_at — the modal assigns those when the user confirms. Nutrition
 *  is scaled to one portion (or per-100g if no portion); the user can adjust. */
export const foodToPrefill = (food: Food): Partial<FoodEntry> => {
  const v = portionView(food)
  return {
    food_name: food.name,
    food_name_en: food.name_en ?? undefined,
    serving_size: v.serving_size,
    calories: v.calories,
    protein: v.protein,
    carbs: v.carbs,
    fat: v.fat,
    fiber: v.fiber,
  }
}

/** Same as foodToPrefill but for a recommendation suggestion. */
export const suggestionToPrefill = (s: FoodSuggestion): Partial<FoodEntry> => {
  const v = portionView(s)
  return {
    food_name: s.name,
    serving_size: v.serving_size,
    calories: v.calories,
    protein: v.protein,
    carbs: v.carbs,
    fat: v.fat,
    fiber: v.fiber,
  }
}
