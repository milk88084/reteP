import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FoodEntry } from '@/types'
import { Button } from '@/components/ui/Button'

interface ManualEntryModalProps {
  onConfirm: (entry: FoodEntry) => void
  onClose: () => void
  initialEntry?: FoodEntry
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
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
    <div>
      <p className="text-sm font-medium text-ink">{label}</p>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 text-right bg-bg rounded-xl px-3 py-1.5 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-brand"
      />
      <span className="text-xs text-ink-muted w-8">{unit}</span>
    </div>
  </div>
)

export const ManualEntryModal = ({ onConfirm, onClose, initialEntry }: ManualEntryModalProps) => {
  const isEditing = !!initialEntry
  const [foodName, setFoodName] = useState(initialEntry?.food_name ?? '')
  const [servingSize, setServingSize] = useState(initialEntry?.serving_size ?? '1 份')
  const [calories, setCalories] = useState(initialEntry?.calories ?? 0)
  const [protein, setProtein] = useState(initialEntry?.protein ?? 0)
  const [carbs, setCarbs] = useState(initialEntry?.carbs ?? 0)
  const [fat, setFat] = useState(initialEntry?.fat ?? 0)
  const [fiber, setFiber] = useState(initialEntry?.fiber ?? 0)

  const handleConfirm = () => {
    if (!foodName.trim()) return
    const entry: FoodEntry = {
      id: initialEntry?.id ?? `manual-${Date.now()}`,
      food_name: foodName.trim(),
      serving_size: servingSize.trim() || '1 份',
      calories,
      protein,
      carbs,
      fat,
      fiber,
      logged_at: initialEntry?.logged_at ?? new Date().toISOString(),
      image_data_url: initialEntry?.image_data_url,
    }
    onConfirm(entry)
  }

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

            {/* Food name */}
            <div className="mb-1">
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">
                食物名稱 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="例：雞腿便當"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                autoFocus
                className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-muted/40 outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Serving size */}
            <div className="mb-4">
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">份量描述</label>
              <input
                type="text"
                placeholder="例：1 份 (350g)"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-muted/40 outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

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
  )
}
