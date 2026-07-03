import { describe, it, expect } from 'vitest'
import { groupDailyLogs, foodToPrefill, suggestionToPrefill, portionView } from './transform'
import { newId } from '@/utils/id'
import { Food, FoodEntry, FoodSuggestion } from '@/types'

const entry = (id: string): FoodEntry => ({
  id,
  food_name: 'x',
  serving_size: '1份',
  calories: 1,
  protein: 1,
  carbs: 1,
  fat: 1,
  fiber: 1,
  logged_at: '2026-07-01T00:00:00Z',
})

describe('groupDailyLogs', () => {
  it('keys entries by their date', () => {
    const grouped = groupDailyLogs([
      { date: '2026-07-01', entries: [entry('a'), entry('b')] },
      { date: '2026-07-03', entries: [entry('c')] },
    ])
    expect(Object.keys(grouped)).toEqual(['2026-07-01', '2026-07-03'])
    expect(grouped['2026-07-01']).toHaveLength(2)
    expect(grouped['2026-07-03'][0].id).toBe('c')
  })

  it('returns an empty object for no days', () => {
    expect(groupDailyLogs([])).toEqual({})
  })
})

describe('portionView', () => {
  const base = { calories: 350, protein: 8, carbs: 77, fat: 2.6, fiber: 3.3 }

  it('scales nutrition to one portion when portion_grams is set', () => {
    const v = portionView({ ...base, portion_label: '碗', portion_grams: 200 })
    expect(v.label).toBe('1碗')
    expect(v.serving_size).toBe('1碗（200g）')
    expect(v.calories).toBe(700) // 350 * 2
    expect(v.carbs).toBe(154) // 77 * 2
  })

  it('rounds scaled values to one decimal', () => {
    const v = portionView({ ...base, portion_label: '份', portion_grams: 150 })
    expect(v.protein).toBe(12) // 8 * 1.5
    expect(v.fat).toBe(3.9) // 2.6 * 1.5
  })

  it('falls back to per-100g when no portion data', () => {
    const v = portionView({ ...base })
    expect(v.label).toBe('每100g')
    expect(v.serving_size).toBe('每100g')
    expect(v.calories).toBe(350)
  })

  it('falls back when grams is zero or label missing', () => {
    expect(portionView({ ...base, portion_label: '碗', portion_grams: 0 }).label).toBe('每100g')
    expect(portionView({ ...base, portion_grams: 200 }).label).toBe('每100g')
  })
})

describe('foodToPrefill', () => {
  const food: Food = {
    id: 'f1',
    name: '白飯',
    name_en: 'White rice',
    category: '主食',
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    serving_size: '每100g',
    owner_id: null,
    source: 'system',
  }

  it('copies name, serving and nutrition without an id or logged_at', () => {
    const seed = foodToPrefill(food)
    expect(seed.food_name).toBe('白飯')
    expect(seed.food_name_en).toBe('White rice')
    expect(seed.serving_size).toBe('每100g')
    expect(seed.calories).toBe(130)
    expect(seed.protein).toBe(2.7)
    expect(seed).not.toHaveProperty('id')
    expect(seed).not.toHaveProperty('logged_at')
  })

  it('maps a null name_en to undefined', () => {
    expect(foodToPrefill({ ...food, name_en: null }).food_name_en).toBeUndefined()
  })
})

describe('suggestionToPrefill', () => {
  const suggestion: FoodSuggestion = {
    food_id: 's1',
    name: '雞胸肉',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
  }

  it('maps a suggestion to a per-100g prefill without an id', () => {
    const seed = suggestionToPrefill(suggestion)
    expect(seed.food_name).toBe('雞胸肉')
    expect(seed.serving_size).toBe('每100g')
    expect(seed.protein).toBe(31)
    expect(seed).not.toHaveProperty('id')
    expect(seed).not.toHaveProperty('logged_at')
  })
})

describe('newId', () => {
  it('produces a v4 UUID format', () => {
    expect(newId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })

  it('produces unique ids', () => {
    expect(newId()).not.toBe(newId())
  })
})
