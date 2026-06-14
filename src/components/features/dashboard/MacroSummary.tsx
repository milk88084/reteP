import { motion } from 'framer-motion'
import { formatNum } from '@/utils/nutritionCalc'

interface MacroBarProps {
  label: string
  current: number
  goal: number
  color: string
  unit?: string
}

const MacroBar = ({ label, current, goal, color, unit = 'g' }: MacroBarProps) => {
  const progress = Math.min(current / goal, 1)
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-ink-muted">{label}</span>
        <span className="text-xs font-semibold text-ink">
          {formatNum(current)}<span className="text-ink-muted font-normal"> / {goal}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  )
}

interface MacroSummaryProps {
  protein: number
  carbs: number
  fat: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
}

export const MacroSummary = ({ protein, carbs, fat, proteinGoal, carbsGoal, fatGoal }: MacroSummaryProps) => (
  <div className="space-y-3">
    <MacroBar label="蛋白質" current={protein} goal={proteinGoal} color="#6B9EFF" />
    <MacroBar label="碳水化合物" current={carbs} goal={carbsGoal} color="#FFC93C" />
    <MacroBar label="脂肪" current={fat} goal={fatGoal} color="#FF8C69" />
  </div>
)
