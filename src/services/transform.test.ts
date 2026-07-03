import { describe, it, expect } from 'vitest'
import { groupDailyLogs, foodToPrefill } from './transform'
import { newId } from '@/utils/id'
import { Food, FoodEntry } from '@/types'

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
