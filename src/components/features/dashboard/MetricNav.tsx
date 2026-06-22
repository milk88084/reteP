import { useRef } from 'react'
import { motion } from 'framer-motion'

interface NavItem {
  kind: 'action' | 'metric'
  id: string
  label: string
  color: string
}

const ITEMS: NavItem[] = [
  { kind: 'action',  id: 'manual',   label: '手動輸入',    color: '#9E9E9E' },
  { kind: 'metric',  id: 'protein',  label: '蛋白質',     color: '#6B9EFF' },
  { kind: 'metric',  id: 'calories', label: '熱量',       color: '#FF6041' },
  { kind: 'metric',  id: 'carbs',    label: '碳水化合物',  color: '#FFC93C' },
  { kind: 'action',  id: 'camera',   label: '拍照',       color: '#9E9E9E' },
]

const LEFT   = [12, 31, 50, 69, 88]
const BOTTOM = [50, 43, 40, 43, 50]

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8e4de" strokeWidth="2.4" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const CameraIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8e4de" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

interface MetricNavProps {
  activeIdx: number
  onSelect: (idx: number) => void
}

export const MetricNav = ({ activeIdx, onSelect }: MetricNavProps) => {
  const startX = useRef<number | null>(null)

  /* Swipe only cycles through metric slots (1-3); clicking 0/4 fires navigation */
  const move = (dir: 1 | -1) => {
    const target = Math.max(1, Math.min(3, activeIdx + dir))
    if (target !== activeIdx) onSelect(target)
  }

  const onTouchStart = (e: React.TouchEvent) => { e.stopPropagation(); startX.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    e.stopPropagation()
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    startX.current = null
    if (Math.abs(dx) < 40) return
    move(dx < 0 ? 1 : -1)
  }
  const onMouseDown = (e: React.MouseEvent) => { e.stopPropagation(); startX.current = e.clientX }
  const onMouseUp   = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) < 40) return
    move(dx < 0 ? 1 : -1)
  }

  return (
    <motion.div
      className="fixed inset-x-0 bottom-6 z-[60] mx-auto max-w-[430px] px-4 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div
        className="relative h-[128px] w-full pointer-events-auto select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        <svg
          className="absolute inset-0 h-full w-full drop-shadow-xl"
          viewBox="0 0 400 128"
          preserveAspectRatio="none"
        >
          <path
            d="M36,16
               Q200,34 364,16
               Q384,18 384,40
               L384,62
               Q384,84 366,92
               Q200,122 34,92
               Q16,84 16,62
               L16,40
               Q16,18 36,16 Z"
            fill="#2a2a2c"
          />
        </svg>

        {ITEMS.map((item, i) => {
          const isActive = i === activeIdx && item.kind === 'metric'
          return (
            <button
              key={item.id}
              onClick={() => onSelect(i)}
              aria-label={item.label}
              className="absolute flex -translate-x-1/2 items-center justify-center"
              style={{ left: `${LEFT[i]}%`, bottom: BOTTOM[i], width: 44, height: 44 }}
            >
              {item.kind === 'action' ? (
                item.id === 'manual' ? <PlusIcon /> : <CameraIcon />
              ) : isActive ? (
                <motion.div
                  layoutId="nav-active"
                  className="absolute flex items-center justify-center rounded-full"
                  style={{ width: 44, height: 44, backgroundColor: `${item.color}30` }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                >
                  <span
                    className="rounded-full"
                    style={{ width: 20, height: 20, backgroundColor: item.color }}
                  />
                </motion.div>
              ) : (
                <span
                  className="rounded-full"
                  style={{ width: 16, height: 16, backgroundColor: item.color }}
                />
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
