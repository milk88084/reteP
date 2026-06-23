import { FoodEntry, DailySummary, GenderType, GoalType, UserSettings } from '@/types'

export const calcProgress = (current: number, goal: number): number =>
  Math.min(Math.max(current / goal, 0), 1)

export const sumEntries = (entries: FoodEntry[]): DailySummary =>
  entries.reduce(
    (acc, e) => ({
      total_calories: acc.total_calories + e.calories,
      total_protein: acc.total_protein + e.protein,
      total_carbs: acc.total_carbs + e.carbs,
      total_fat: acc.total_fat + e.fat,
      total_fiber: acc.total_fiber + e.fiber,
    }),
    { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, total_fiber: 0 }
  )

export const formatNum = (n: number, decimals = 1): string =>
  Number.isInteger(n) ? n.toString() : n.toFixed(decimals)

export const calcTDEE = (
  height: number,
  weight: number,
  age: number,
  gender: GenderType,
  goal: GoalType,
): Pick<UserSettings, 'calorie_goal' | 'protein_goal' | 'carbs_goal' | 'fat_goal'> => {
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : gender === 'female'
        ? 10 * weight + 6.25 * height - 5 * age - 161
        : 10 * weight + 6.25 * height - 5 * age - 78

  const tdee = bmr * 1.55
  const adjust = { lose: -500, maintain: 0, gain: 300 }
  const calories = Math.max(1200, Math.round(tdee + adjust[goal]))

  const proteinPerKg = { lose: 1.8, maintain: 1.4, gain: 2.0 }
  const protein = Math.round(weight * proteinPerKg[goal])
  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))

  return { calorie_goal: calories, protein_goal: protein, carbs_goal: carbs, fat_goal: fat }
}
