import { FoodEntry } from '@/types'
import { FoodCard } from './FoodCard'
import { FoodCardSkeleton } from '@/components/ui/Skeleton'

interface FoodListProps {
  entries: FoodEntry[]
  onDelete: (id: string) => void
  onEdit: (entry: FoodEntry) => void
  isLoading?: boolean
}

export const FoodList = ({ entries, onDelete, onEdit, isLoading }: FoodListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => <FoodCardSkeleton key={i} />)}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="w-20 h-20 rounded-3xl bg-surface flex items-center justify-center mb-5">
          <span className="text-4xl select-none">🍽️</span>
        </div>
        <p className="text-ink-muted text-sm text-center leading-relaxed">
          還沒有紀錄<br />拍張照片開始吧
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <FoodCard key={entry.id} entry={entry} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  )
}
