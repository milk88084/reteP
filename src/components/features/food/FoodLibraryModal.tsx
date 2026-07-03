import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Food } from '@/types'
import { searchFoods } from '@/services/foodRecognitionApi'
import { portionView } from '@/services/transform'
import { formatNum } from '@/utils/nutritionCalc'

interface FoodLibraryModalProps {
  onSelect: (food: Food) => void
  onClose: () => void
}

export const FoodLibraryModal = ({ onSelect, onClose }: FoodLibraryModalProps) => {
  const [query, setQuery] = useState('')
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Debounced search — refetches 250ms after the user stops typing.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    const t = setTimeout(() => {
      searchFoods(query)
        .then((data) => { if (!cancelled) setFoods(data) })
        .catch((e) => {
          if (!cancelled) { setError(true); setFoods([]) }
          console.error('[searchFoods]', e)
        })
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 250)
    return () => { cancelled = true; clearTimeout(t) }
  }, [query])

  const stop = (e: React.TouchEvent | React.MouseEvent) => e.stopPropagation()
  const listRef = useRef<HTMLDivElement>(null)

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-ink/70 flex items-end justify-center"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="w-full max-w-lg bg-bg rounded-t-3xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          <div className="px-5 pt-2 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-ink">食物庫</h2>
              <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors text-sm">
                取消
              </button>
            </div>

            <input
              type="text"
              placeholder="搜尋食物名稱…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-muted/40 outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Results */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-5 pb-6 scrollbar-hide"
            onTouchStart={stop}
            onTouchMove={stop}
          >
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
              </div>
            ) : error ? (
              <p className="text-center text-sm text-ink-muted py-10">載入失敗,請稍後再試</p>
            ) : foods.length === 0 ? (
              <p className="text-center text-sm text-ink-muted py-10">
                {query.trim() ? '找不到符合的食物' : '食物庫是空的'}
              </p>
            ) : (
              <div className="space-y-1.5">
                {foods.map((food) => {
                  const v = portionView(food)
                  return (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => onSelect(food)}
                      className="w-full flex items-center justify-between gap-3 bg-surface rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">
                          {food.name}
                          <span className="text-ink-muted font-normal"> · {v.label}</span>
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5 truncate">
                          蛋 {formatNum(v.protein)}g・碳 {formatNum(v.carbs)}g・脂 {formatNum(v.fat)}g
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="text-sm font-bold text-ink">{formatNum(v.calories)}</span>
                        <span className="text-xs text-ink-muted ml-0.5">kcal</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
