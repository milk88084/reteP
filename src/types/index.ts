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
