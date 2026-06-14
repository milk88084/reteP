import { useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { HomePage } from '@/pages/HomePage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'

type PageId = 'settings' | 'home' | 'history'
const ORDER: Record<PageId, number> = { settings: 0, home: 1, history: 2 }

/* ── FAB icons ── */
const PlusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const PencilIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

/* ── Sub-button ── */
const SubBtn = ({ label, icon, onClick, delay = 0 }: {
  label: string; icon: React.ReactNode; onClick: () => void; delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14, scale: 0.7 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 14, scale: 0.7 }}
    transition={{ type: 'spring', stiffness: 380, damping: 26, delay }}
    className="flex flex-col items-center gap-1.5 pointer-events-auto"
  >
    <span className="text-[10px] font-semibold text-ink bg-bg/95 px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
      {label}
    </span>
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-full bg-bg border border-border shadow-lg flex items-center justify-center text-ink active:scale-95 transition-transform"
    >
      {icon}
    </button>
  </motion.div>
)

/* ── Slide variants ── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0.6 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0.6 }),
}

export const AppShell = () => {
  const { isLoaded, isSignedIn } = useAuth()
  const { setShowManualEntry, triggerCamera } = useUIStore()

  const [page, setPage] = useState<PageId>('home')
  const [direction, setDirection] = useState(0)
  const [fabOpen, setFabOpen] = useState(false)

  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const mouseStart = useRef<{ x: number; y: number } | null>(null)

  if (!isLoaded) return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  )
  if (!isSignedIn) return <Navigate to="/login" replace />

  const goTo = (to: PageId) => {
    if (to === page) return
    setDirection(ORDER[to] > ORDER[page] ? 1 : -1)
    setPage(to)
    setFabOpen(false)
  }

  /* ── Swipe detection ── */
  const checkSwipe = (dx: number, dy: number) => {
    if (Math.abs(dx) < Math.abs(dy) * 1.2 || Math.abs(dx) < 65) return
    if (dx < 0) { // swipe left → history direction
      if (page === 'settings') goTo('home')
      else if (page === 'home') goTo('history')
    } else {      // swipe right → settings direction
      if (page === 'history') goTo('home')
      else if (page === 'home') goTo('settings')
    }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    checkSwipe(
      e.changedTouches[0].clientX - touchStart.current.x,
      e.changedTouches[0].clientY - touchStart.current.y,
    )
    touchStart.current = null
  }
  const onMouseDown = (e: React.MouseEvent) => {
    mouseStart.current = { x: e.clientX, y: e.clientY }
  }
  const onMouseUp = (e: React.MouseEvent) => {
    if (!mouseStart.current) return
    checkSwipe(e.clientX - mouseStart.current.x, e.clientY - mouseStart.current.y)
    mouseStart.current = null
  }

  /* ── FAB actions ── */
  const handleCamera = () => {
    setFabOpen(false)
    if (page !== 'home') goTo('home')
    triggerCamera()
  }
  const handleManual = () => {
    setFabOpen(false)
    if (page !== 'home') goTo('home')
    setShowManualEntry(true)
  }

  return (
    <div
      className="fixed inset-0 bg-bg overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {/* Page content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', ease: [0.32, 0, 0.67, 0], duration: 0.26 }}
          className="absolute inset-0 overflow-y-auto overscroll-none"
        >
          <div className="min-h-full max-w-lg mx-auto px-4 pb-32 pt-4">
            {page === 'home'     && <HomePage />}
            {page === 'history'  && <HistoryPage />}
            {page === 'settings' && <SettingsPage />}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dim overlay when FAB is open */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-ink/15 backdrop-blur-[2px]"
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Bottom FAB bar — black hourglass bar + orange button with dashed ring */}
      <div className="absolute bottom-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">

        {/* Sub-buttons — appear above the bar */}
        <AnimatePresence>
          {fabOpen && (
            <div className="flex items-end gap-10 mb-5 pointer-events-none">
              <SubBtn label="手動輸入" icon={<PencilIcon />} onClick={handleManual} delay={0.04} />
              <SubBtn label="拍照記錄" icon={<CameraIcon />} onClick={handleCamera} delay={0} />
            </div>
          )}
        </AnimatePresence>

        {/* Black panel with a circular cradle notch holding the FAB */}
        <div className="relative w-full" style={{ height: 116 }}>

          {/* Black panel — full width, rounded top corners */}
          <div
            className="pointer-events-auto absolute bottom-0 left-0 right-0 bg-[#0f0f0f] rounded-t-[40px]"
            style={{ height: 84, boxShadow: '0 -8px 24px rgba(0,0,0,0.30)' }}
          />

          {/* Helper text on the panel */}
          <div className="absolute left-0 right-0 flex justify-center" style={{ bottom: 20 }}>
            <span className="text-[11px] tracking-wide text-white/55">點按以新增一筆記錄</span>
          </div>

          {/* Cream cradle — carves a concave circular notch into the panel's top edge */}
          <div
            className="absolute rounded-full bg-bg"
            style={{ width: 80, height: 80, left: '50%', top: -8, transform: 'translateX(-50%)' }}
          />

          {/* Dashed ring inside the cradle */}
          <svg
            className="absolute pointer-events-none" width="74" height="74" viewBox="0 0 74 74"
            style={{ left: '50%', top: -5, transform: 'translateX(-50%)' }} aria-hidden="true"
          >
            <circle cx="37" cy="37" r="36" fill="none"
              stroke="rgba(110,110,110,0.6)" strokeWidth="1.4"
              strokeDasharray="1.5 7" strokeLinecap="round" />
          </svg>

          {/* FAB — nested in the cradle, half above the panel edge */}
          <div className="absolute z-10 flex justify-center" style={{ left: '50%', top: 0, transform: 'translateX(-50%)' }}>
            <motion.button
              animate={{ rotate: fabOpen ? 45 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={() => setFabOpen((v) => !v)}
              aria-label="新增記錄"
              className="pointer-events-auto w-16 h-16 rounded-full bg-accent flex items-center justify-center active:scale-95 transition-transform"
              style={{ boxShadow: '0 10px 28px rgba(255,96,65,0.5)' }}
            >
              <PlusIcon />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
