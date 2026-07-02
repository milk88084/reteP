import { describe, it, expect } from 'vitest'
import { groupDailyLogs } from './transform'
import { newId } from '@/utils/id'
import { FoodEntry } from '@/types'

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
