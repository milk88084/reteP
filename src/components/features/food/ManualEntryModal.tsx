import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format, subDays, parseISO } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { FoodEntry } from '@/types'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { getTodayStr } from '@/utils/dateUtils'
import { newId } from '@/utils/id'

const FOOD_EMOJIS = [
  '🍱','🍜','🍛','🍝','🍲','🥗','🥙','🌮','🌯',
  '🍔','🌭','🍕','🥪','🍳','🥘','🍗','🍖',
  '🍰','🎂','🧁','🍩','🍪','🍫','🍬','🍭',
  '🥤','☕','🧃','🍵','🥛',
  '🥐','🥖','🧇','🥓','🧀','🥚',
  '🍎','🍊','🍋','🍇','🍓','🥝','🥑',
  '🥦','🥕','🌽','🥔','🍅',
]

const PRESETS = ['早餐', '午餐', '晚餐', '點心', '宵夜']

const DateStrip = ({ value, onChange }: { value: string; onChange: (d: string) => void }) => {
  const today = getTodayStr()
  const days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = subDays(parseISO(today), 29 - i)
      const str = format(d, 'yyyy-MM-dd')
      return { str, d }
    })
  }, [today])

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    // scroll to end (today) on mount
    el.scrollLeft = el.scrollWidth
  }, [])

  const stopPropagation = (e: React.TouchEvent | React.MouseEvent) => e.stopPropagation()

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      style={{ scrollbarWidth: 'none' }}
      onTouchStart={stopPropagation}
      onTouchMove={stopPropagation}
      onTouchEnd={stopPropagation}
      onMouseDown={stopPropagation}
      onMouseUp={stopPropagation}
    >
      {days.map(({ str, d }) => {
        const isToday = str === today
        const isSelected = str === value
        const dayLabel = isToday ? '今' : format(d, 'EEE', { locale: zhTW }).replace('週', '')
        return (
          <button
            key={str}
            type="button"
            onClick={() => onChange(str)}
            className="flex-shrink-0 flex flex-col items-center gap-1 py-1"
          >
            <span className={`text-[10px] font-medium ${isSelected ? 'text-accent' : 'text-ink-muted'}`}>
              {dayLabel}
            </span>
            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              isSelected
                ? 'bg-accent text-white'
                : isToday
                  ? 'bg-surface text-ink ring-1 ring-accent/40'
                  : 'bg-surface text-ink-muted'
            }`}>
              {format(d, 'd')}
            </span>
          </button>
        )
      })}
    </div>
  )
}

interface ManualEntryModalProps {
  onConfirm: (entry: FoodEntry, date: string) => void
  onClose: () => void
  initialEntry?: FoodEntry
  initialDate?: string
  /** Seed values for a NEW entry (e.g. picked from the food library). Unlike
   *  initialEntry this does not switch the modal into edit mode. */
  prefill?: Partial<FoodEntry>
}

const NumInput = ({
  label,
  unit,
  value,
  onChange,
}: {
  label: string
  unit: string
  value: number
  onChange: (v: number) => void
}) => {
  const [raw, setRaw] = useState(value === 0 ? '' : String(value))
  const committed = useRef(value)

  useEffect(() => {
    if (committed.current !== value) {
      committed.current = value
      setRaw(value === 0 ? '' : String(value))
    }
  }, [value])

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={raw}
          placeholder="0"
          onChange={(e) => {
            const str = e.target.value
            if (!/^\d*\.?\d*$/.test(str)) return
            setRaw(str)
            const n = parseFloat(str)
            const next = isNaN(n) ? 0 : n
            committed.current = next
            onChange(next)
          }}
          onFocus={(e) => e.target.select()}
          className="w-20 text-right bg-bg rounded-xl px-3 py-1.5 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-brand"
        />
        <span className="text-xs text-ink-muted w-8">{unit}</span>
      </div>
    </div>
  )
}

export const ManualEntryModal = ({ onConfirm, onClose, initialEntry, initialDate, prefill }: ManualEntryModalProps) => {
  const isEditing = !!initialEntry
  const seed = initialEntry ?? prefill
  const [emoji, setEmoji] = useState(seed?.emoji ?? '')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [foodName, setFoodName] = useState(seed?.food_name ?? '')
  const [servingSize, setServingSize] = useState(seed?.serving_size ?? '1 份')
  const [logDate, setLogDate] = useState(initialDate ?? getTodayStr())
  const [calories, setCalories] = useState(seed?.calories ?? 0)
  const [protein, setProtein] = useState(seed?.protein ?? 0)
  const [carbs, setCarbs] = useState(seed?.carbs ?? 0)
  const [fat, setFat] = useState(seed?.fat ?? 0)
  const [fiber, setFiber] = useState(seed?.fiber ?? 0)
  const [showConfirm, setShowConfirm] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showEmojiPicker) return
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showEmojiPicker])

  const buildEntry = (): FoodEntry => ({
    id: initialEntry?.id ?? newId(),
    food_name: foodName.trim(),
    serving_size: servingSize.trim() || '1 份',
    emoji: emoji || undefined,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    logged_at: initialEntry?.logged_at ?? new Date().toISOString(),
    image_data_url: initialEntry?.image_data_url,
  })

  const handleConfirm = () => {
    if (!foodName.trim()) return
    if (isEditing) { setShowConfirm(true); return }
    onConfirm(buildEntry(), logDate)
  }

  return (
    <>
      {showConfirm && (
        <ConfirmDialog
          message="確定要儲存變更嗎？"
          confirmLabel="儲存"
          onConfirm={() => { setShowConfirm(false); onConfirm(buildEntry(), logDate) }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {createPortal(
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
              className="w-full max-w-lg bg-bg rounded-t-3xl overflow-hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="px-5 pb-6 pt-2 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-ink">{isEditing ? '編輯食物' : '手動新增食物'}</h2>
                  <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors text-sm">
                    取消
                  </button>
                </div>

                {/* Food name + emoji */}
                <div className="mb-1">
                  <label className="text-xs font-medium text-ink-muted mb-1.5 block">
                    食物名稱 <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    {/* Emoji picker button */}
                    <div ref={emojiPickerRef} className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker((v) => !v)}
                        className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-2xl hover:bg-border transition-colors"
                      >
                        {emoji || '🍽️'}
                      </button>
                      <AnimatePresence>
                        {showEmojiPicker && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute left-0 top-14 z-10 bg-bg border border-border rounded-2xl shadow-xl p-3 w-64"
                          >
                            <div className="grid grid-cols-7 gap-1">
                              {FOOD_EMOJIS.map((e) => (
                                <button
                                  key={e}
                                  type="button"
                                  onClick={() => { setEmoji(e); setShowEmojiPicker(false) }}
                                  className={`text-xl p-1 rounded-lg transition-colors hover:bg-surface ${emoji === e ? 'bg-brand/20' : ''}`}
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                            {emoji && (
                              <button
                                type="button"
                                onClick={() => { setEmoji(''); setShowEmojiPicker(false) }}
                                className="mt-2 w-full text-xs text-ink-muted hover:text-ink transition-colors py-1"
                              >
                                清除 emoji
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <input
                      type="text"
                      placeholder="例：雞腿便當"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      autoFocus
                      className="flex-1 bg-surface rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-muted/40 outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>

                  {/* Preset quick-fill */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFoodName(p)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          foodName === p
                            ? 'bg-ink text-bg border-ink'
                            : 'bg-surface text-ink-muted border-border hover:border-ink hover:text-ink'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Serving size */}
                <div className="mb-4 mt-3">
                  <label className="text-xs font-medium text-ink-muted mb-1.5 block">份量描述</label>
                  <input
                    type="text"
                    placeholder="例：1 份 (350g)"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-muted/40 outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                {/* Date strip — new entries only */}
                {!isEditing && (
                  <div className="mb-4">
                    <label className="text-xs font-medium text-ink-muted mb-1.5 block">日期</label>
                    <DateStrip value={logDate} onChange={setLogDate} />
                  </div>
                )}

                {/* Nutrition */}
                <div className="bg-surface rounded-2xl px-4 py-1 mb-5">
                  <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider pt-3 pb-1">營養成分</p>
                  <NumInput label="熱量" unit="kcal" value={calories} onChange={setCalories} />
                  <NumInput label="蛋白質" unit="g" value={protein} onChange={setProtein} />
                  <NumInput label="碳水化合物" unit="g" value={carbs} onChange={setCarbs} />
                  <NumInput label="脂肪" unit="g" value={fat} onChange={setFat} />
                  <NumInput label="膳食纖維" unit="g" value={fiber} onChange={setFiber} />
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  disabled={!foodName.trim()}
                  onClick={handleConfirm}
                >
                  {isEditing ? '儲存變更' : '加入記錄'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
