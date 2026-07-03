import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FoodSuggestion, Recommendation } from '@/types'
import { getRecommendations } from '@/services/foodRecognitionApi'
import { portionView } from '@/services/transform'
import { getTodayStr } from '@/utils/dateUtils'
import { formatNum } from '@/utils/nutritionCalc'

const DEFICIT_LABELS: Record<string, string> = {
  protein: '蛋白質',
  carbs: '碳水',
  fat: '脂肪',
  fiber: '纖維',
}

interface RecommendationModalProps {
  onSelect: (suggestion: FoodSuggestion) => void
  onClose: () => void
}

export const RecommendationModal = ({ onSelect, onClose }: RecommendationModalProps) => {
  const [rec, setRec] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getRecommendations(getTodayStr())
      .then((data) => { if (!cancelled) setRec(data) })
      .catch((e) => {
        if (!cancelled) setError(true)
        console.error('[getRecommendations]', e)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const stop = (e: React.TouchEvent | React.MouseEvent) => e.stopPropagation()
  const deficitLabel = rec?.primary_deficit ? DEFICIT_LABELS[rec.primary_deficit] : null

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

          <div className="px-5 pt-2 pb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">今日營養推薦</h2>
            <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors text-sm">
              關閉
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto px-5 pb-6 scrollbar-hide"
            onTouchStart={stop}
            onTouchMove={stop}
          >
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
              </div>
            ) : error || !rec ? (
              <p className="text-center text-sm text-ink-muted py-10">載入失敗,請稍後再試</p>
            ) : (
              <>
                {/* Deficit badge + message */}
                <div className="mb-4">
                  {deficitLabel && (
                    <span className="inline-block bg-brand/15 text-brand text-xs font-semibold rounded-full px-3 py-1 mb-2">
                      最缺 {deficitLabel}
                    </span>
                  )}
                  <p className="text-sm text-ink leading-relaxed">{rec.message}</p>
                </div>

                {rec.suggestions.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <span className="text-4xl mb-2">🎉</span>
                    <p className="text-sm text-ink-muted">
                      {deficitLabel ? '目前沒有適合的建議食物' : '各項營養都達標了,做得很好!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {rec.suggestions.map((s) => {
                      const v = portionView(s)
                      return (
                        <button
                          key={s.food_id}
                          type="button"
                          onClick={() => onSelect(s)}
                          className="w-full flex items-center justify-between gap-3 bg-surface rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">
                              {s.name}
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
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
