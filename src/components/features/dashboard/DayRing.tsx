import { motion } from 'framer-motion'

interface DayRingProps {
  label: string
  calories: number
  calorieGoal: number
  protein: number
  carbs: number
  detailed?: boolean   // when false, keep only the ring outline; hide the readouts
}

const SIZE = 300
const CX = 150
const CY = 150
const R = 122           // progress track radius
const STROKE = 6
const C = 2 * Math.PI * R
const HUB_R = 52        // central black button radius

export const DayRing = ({ label, calories, calorieGoal, protein, carbs, detailed = true }: DayRingProps) => {
  const pct = calorieGoal > 0 ? Math.min(1, calories / calorieGoal) : 0
  const dashOffset = C * (1 - pct)
  const progressColor = pct >= 1 ? '#34C759' : '#FF6041'
  const fade = { duration: 0.3 }

  return (
    <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>

      {/* SVG ring — always visible so unselected cards still read as circles.
          Track stays put; the coloured progress arc only shows when detailed. */}
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth={STROKE} />
        <motion.circle
          cx={CX} cy={CY} r={R} fill="none"
          stroke={progressColor} strokeWidth={STROKE} strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: dashOffset, opacity: detailed ? 1 : 0 }}
          transition={{ strokeDashoffset: { duration: 0.85, ease: 'easeOut' }, opacity: fade }}
          transform={`rotate(-90 ${CX} ${CY})`}
        />
      </svg>

      {/* Readouts — fade out together when the card is not selected */}
      {/* Top: day label */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center"
        style={{ top: 44 }}
        animate={{ opacity: detailed ? 1 : 0 }}
        transition={fade}
      >
        <span className="text-[15px] font-bold tracking-tight text-ink">{label}</span>
      </motion.div>

      {/* Center black hub button */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: detailed ? 1 : 0 }}
        transition={fade}
      >
        <div
          className="rounded-full bg-ink flex flex-col items-center justify-center shadow-xl"
          style={{ width: HUB_R * 2, height: HUB_R * 2 }}
        >
          <span className="font-black text-white leading-none" style={{ fontSize: 30 }}>{Math.round(calories)}</span>
          <span className="text-[9px] text-white/55 tracking-wide mt-0.5">kcal</span>
        </div>
      </motion.div>

      {/* Below hub: goal ratio + macros */}
      <motion.div
        className="absolute left-0 right-0 flex flex-col items-center gap-1"
        style={{ top: 206 }}
        animate={{ opacity: detailed ? 1 : 0 }}
        transition={fade}
      >
        <span className="text-[13px] font-semibold text-ink/55 tabular-nums">{Math.round(calories)} / {calorieGoal}</span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-ink/45">碳水 <b style={{ color: '#D9A400' }}>{Math.round(carbs)}</b>g</span>
          <span className="text-[10px] text-ink/45">蛋白 <b style={{ color: '#6B9EFF' }}>{Math.round(protein)}</b>g</span>
        </div>
      </motion.div>
    </div>
  )
}
