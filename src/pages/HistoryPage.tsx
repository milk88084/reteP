import { useState } from 'react'
import { FoodList } from '@/components/features/food/FoodList'
import { CalorieRing } from '@/components/features/dashboard/CalorieRing'
import { useFoodLogStore } from '@/store/foodLogStore'
import { useSettingsStore } from '@/store/settingsStore'
import { getLast7Days } from '@/utils/dateUtils'
import { cn } from '@/utils/cn'
import { deleteEntry } from '@/services/foodRecognitionApi'

const days = getLast7Days()

export const HistoryPage = () => {
  const [selectedDate, setSelectedDate] = useState(days[0].dateStr)
  const { getEntriesForDate, getDailySummary, removeEntry } = useFoodLogStore()
  const { settings } = useSettingsStore()

  const entries = getEntriesForDate(selectedDate)
  const summary = getDailySummary(selectedDate)

  const handleDelete = async (id: string) => {
    removeEntry(selectedDate, id)
    await deleteEntry(id, selectedDate).catch(() => {})
  }

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-ink">歷史紀錄</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {days.map(({ dateStr, label }) => (
          <button
            key={dateStr}
            onClick={() => setSelectedDate(dateStr)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
              selectedDate === dateStr
                ? 'bg-ink text-bg'
                : 'bg-surface text-ink-muted'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {entries.length > 0 && (
        <div className="flex items-center gap-4 bg-surface rounded-2xl p-4">
          <div className="flex-shrink-0">
            <CalorieRing current={summary.total_calories} goal={settings.calorie_goal} />
          </div>
        </div>
      )}

      <FoodList entries={entries} onDelete={handleDelete} />
    </div>
  )
}
