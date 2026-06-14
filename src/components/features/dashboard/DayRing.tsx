import { motion } from 'framer-motion'

interface DayRingProps {
  label: string
  calories: number
  calorieGoal: number
  protein: number
  carbs: number
  onPrev?: () => void
  onNext?: () => void
  canPrev?: boolean
  canNext?: boolean
}

const SIZE = 300
const CX = 150
const CY = 150
const R = 122           // progress track radius
const STROKE = 6
const C = 2 * Math.PI * R
const HUB_R = 52        // central black button radius

// Graduated tick bezel (the "tuner dial" look)
const TICK_COUNT = 120
const TICKS = Array.from({ length: TICK_COUNT }, (_, i) => {
  const ang = (i / TICK_COUNT) * Math.PI * 2 - Math.PI / 2
  const major = i % 10 === 0
  const rOut = 142
  const rIn = major ? 130 : 135
  const cos = Math.cos(ang)
  const sin = Math.sin(ang)
  return {
    x1: CX + rIn * cos, y1: CY + rIn * sin,
    x2: CX + rOut * cos, y2: CY + rOut * sin,
    major,
  }
})

const SideBtn = ({ dir, onClick, disabled }: { dir: 'prev' | 'next'; onClick?: () => void; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-10 h-10 rounded-full border border-ink/15 bg-bg flex items-center justify-center text-ink/70 disabled:opacity-25 active:scale-90 transition-transform"
    aria-label={dir === 'prev' ? '前一天' : '後一天'}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'prev' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  </button>
)

export const DayRing = ({ label, calories, calorieGoal, protein, carbs, onPrev, onNext, canPrev, canNext }: DayRingProps) => {
  const pct = calorieGoal > 0 ? Math.min(1, calories / calorieGoal) : 0
  const dashOffset = C * (1 - pct)
  const progressColor = pct >= 1 ? '#34C759' : '#FF6041'

  return (
    <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>

      {/* SVG: tick bezel + thin progress ring */}
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0">
        {TICKS.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.major ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0.13)'}
            strokeWidth={t.major ? 1.6 : 1} strokeLinecap="round" />
        ))}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={STROKE} />
        <motion.circle
          cx={CX} cy={CY} r={R} fill="none"
          stroke={progressColor} strokeWidth={STROKE} strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          transform={`rotate(-90 ${CX} ${CY})`}
        />
      </svg>

      {/* Top: day label (like "Invoice Reviews") */}
      <div className="absolute left-0 right-0 flex justify-center" style={{ top: 44 }}>
        <span className="text-[15px] font-bold tracking-tight text-ink">{label}</span>
      </div>

      {/* Center black hub button (like the play button) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full bg-ink flex flex-col items-center justify-center shadow-xl"
          style={{ width: HUB_R * 2, height: HUB_R * 2 }}
        >
          <span className="font-black text-white leading-none" style={{ fontSize: 30 }}>{Math.round(calories)}</span>
          <span className="text-[9px] text-white/55 tracking-wide mt-0.5">kcal</span>
        </div>
      </div>

      {/* Left / right round controls (like the ‹10 10› buttons) */}
      <div className="absolute top-1/2 -translate-y-1/2 pointer-events-auto" style={{ left: 18 }}>
        <SideBtn dir="prev" onClick={onPrev} disabled={!canPrev} />
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 pointer-events-auto" style={{ right: 18 }}>
        <SideBtn dir="next" onClick={onNext} disabled={!canNext} />
      </div>

      {/* Below hub: goal ratio + macros (like the time readout / "...") */}
      <div className="absolute left-0 right-0 flex flex-col items-center gap-1" style={{ top: 206 }}>
        <span className="text-[13px] font-semibold text-ink/55 tabular-nums">{Math.round(calories)} / {calorieGoal}</span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-ink/45">碳水 <b style={{ color: '#D9A400' }}>{Math.round(carbs)}</b>g</span>
          <span className="text-[10px] text-ink/45">蛋白 <b style={{ color: '#6B9EFF' }}>{Math.round(protein)}</b>g</span>
        </div>
      </div>
    </div>
  )
}
