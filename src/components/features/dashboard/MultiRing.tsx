import { motion } from 'framer-motion'
import { formatNum } from '@/utils/nutritionCalc'

const VB = 320
const CX = 160
const STROKE = 13
const GAP = 6

// Radii: 148, 129, 110, 91  (each step = STROKE + GAP = 19)
const RINGS = [
  { key: 'calories', label: '熱量',  unit: 'kcal', color: '#FF6041', track: '#FFE0DA', r: 148 },
  { key: 'protein',  label: '蛋白質', unit: 'g',    color: '#6B9EFF', track: '#D8E8FF', r: 129 },
  { key: 'carbs',   label: '碳水',   unit: 'g',    color: '#FFC93C', track: '#FFF3CC', r: 110 },
  { key: 'fat',     label: '脂肪',   unit: 'g',    color: '#FF8C69', track: '#FFE2D6', r: 91  },
]

interface MacroVal { current: number; goal: number }

interface MultiRingProps {
  calories: MacroVal
  protein:  MacroVal
  carbs:    MacroVal
  fat:      MacroVal
}

export const MultiRing = ({ calories, protein, carbs, fat }: MultiRingProps) => {
  const values = [calories, protein, carbs, fat]
  const isOver = calories.current > calories.goal
  const diff   = Math.abs(calories.current - calories.goal)

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Rings */}
      <div className="relative w-full max-w-[300px] aspect-square mx-auto">
        <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-full -rotate-90">
          {RINGS.map(({ key, color, track, r }, i) => {
            const { current, goal } = values[i]
            const circ    = 2 * Math.PI * r
            const progress = goal > 0 ? Math.min(current / goal, 1) : 0
            const offset   = circ * (1 - progress)
            return (
              <g key={key}>
                <circle
                  cx={CX} cy={CX} r={r}
                  fill="none" stroke={track} strokeWidth={STROKE}
                />
                <motion.circle
                  cx={CX} cy={CX} r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1, ease: 'easeOut', delay: i * 0.08 }}
                />
              </g>
            )
          })}
        </svg>

        {/* Center text (counter-rotate so it's upright) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <motion.span
            className="text-5xl font-bold text-ink leading-none tracking-tight"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            {calories.current}
          </motion.span>
          <span className="text-sm text-ink-muted">/ {calories.goal} kcal</span>
          <span className={`text-xs font-medium mt-0.5 ${isOver ? 'text-[#FF6041]' : 'text-ink-muted'}`}>
            {isOver ? `超出 ${diff} kcal` : `剩餘 ${diff} kcal`}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full max-w-[280px]">
        {RINGS.map(({ key, label, unit, color }, i) => {
          const { current, goal } = values[i]
          return (
            <div key={key} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <div className="min-w-0">
                <p className="text-[11px] text-ink-muted leading-none mb-0.5">{label}</p>
                <p className="text-xs font-semibold text-ink leading-none">
                  {formatNum(current)}
                  <span className="text-ink-muted font-normal text-[11px]"> / {goal}{unit}</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
