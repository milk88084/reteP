import { motion } from 'framer-motion'

interface CalorieRingProps {
  current: number
  goal: number
}

export const CalorieRing = ({ current, goal }: CalorieRingProps) => {
  const radius = 85
  const stroke = 12
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const progress = Math.min(current / goal, 1)
  const offset = circumference * (1 - progress)
  const isOver = current > goal
  const progressColor = isOver ? '#FFC93C' : '#FF6041'

  return (
    <div className="relative flex items-center justify-center w-52 h-52 mx-auto my-2">
      <svg width="208" height="208" viewBox="0 0 208 208" className="-rotate-90">
        <circle
          cx="104"
          cy="104"
          r={normalizedRadius}
          fill="none"
          stroke="#E8E0D5"
          strokeWidth={stroke}
        />
        <motion.circle
          cx="104"
          cy="104"
          r={normalizedRadius}
          fill="none"
          stroke={progressColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold text-ink leading-none"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {current}
        </motion.span>
        <span className="text-xs text-ink-muted mt-1">/ {goal} kcal</span>
        <span className="text-[10px] text-ink-muted mt-0.5">
          {isOver ? `超出 ${current - goal} kcal` : `剩餘 ${goal - current} kcal`}
        </span>
      </div>
    </div>
  )
}
