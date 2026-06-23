import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FoodEntry } from '@/types'
import { formatTime } from '@/utils/dateUtils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface FoodCardProps {
  entry: FoodEntry
  onDelete: (id: string) => void
  onEdit: (entry: FoodEntry) => void
}

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)

export const FoodCard = ({ entry, onDelete, onEdit }: FoodCardProps) => {
  const [removing, setRemoving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDeleteConfirmed = () => {
    setConfirmDelete(false)
    setRemoving(true)
    setTimeout(() => onDelete(entry.id), 300)
  }

  return (
    <>
      <AnimatePresence>
        {!removing && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => onEdit(entry)}
            className="flex items-center gap-3 p-3 bg-surface rounded-2xl cursor-pointer active:opacity-70 transition-opacity"
          >
            {entry.image_data_url ? (
              <img
                src={entry.image_data_url}
                alt={entry.food_name}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-brand/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl select-none">{entry.emoji || '🍱'}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-ink truncate">{entry.food_name}</p>
              <p className="text-xs text-ink-muted mt-0.5">{entry.serving_size}</p>
              <p className="text-xs text-ink-muted">{formatTime(entry.logged_at)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-base font-bold text-accent">{entry.calories}</span>
              <span className="text-xs text-ink-muted">kcal</span>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                className="p-1.5 text-ink-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
                aria-label="刪除"
              >
                <TrashIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {confirmDelete && (
        <ConfirmDialog
          message={`確定要刪除「${entry.food_name}」嗎？`}
          confirmLabel="刪除"
          danger
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
