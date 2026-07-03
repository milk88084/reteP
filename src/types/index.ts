export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface FoodEntry extends NutritionInfo {
  id: string
  food_name: string
  food_name_en?: string
  serving_size: string
  confidence?: number
  image_data_url?: string
  emoji?: string
  logged_at: string
}

/** A food-library item (backend GET /foods). Nutrition is per `serving_size`. */
export interface Food extends NutritionInfo {
  id: string
  name: string
  name_en?: string | null
  category?: string | null
  serving_size: string
  /** Portion unit + grams (e.g. 碗 / 200). null → no portion data, treat as per-100g. */
  portion_label?: string | null
  portion_grams?: number | null
  owner_id?: string | null
  source: string
}

/** One suggested food in a nutrition recommendation (backend GET /recommendations). */
export interface FoodSuggestion extends NutritionInfo {
  food_id: string
  name: string
  portion_label?: string | null
  portion_grams?: number | null
}

export interface Recommendation {
  date: string
  /** The most-lacking nutrient today ('protein' | 'carbs' | 'fat' | 'fiber'), or null if all goals met. */
  primary_deficit: string | null
  message: string
  suggestions: FoodSuggestion[]
}

export interface DailySummary {
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  total_fiber: number
}

export interface DailyLog {
  date: string
  entries: FoodEntry[]
  summary: DailySummary
}

export interface RecognizeApiResult {
  id: string
  food_name: string
  food_name_en?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  serving_size: string
  confidence: number
  recognized_at: string
}

export interface RecognizeResponse {
  success: boolean
  data?: RecognizeApiResult
  error?: string
}

export type GenderType = 'male' | 'female' | 'other'
export type GoalType = 'lose' | 'maintain' | 'gain'

export interface UserSettings {
  calorie_goal: number
  protein_goal: number
  carbs_goal: number
  fat_goal: number
  height: number
  weight: number
  age: number
  gender: GenderType
  goal: GoalType
}

export interface AuthUser {
  id: string
  name: string
  email?: string
  avatarUrl?: string
}
