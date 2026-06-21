import { useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { MetricNav } from '@/components/features/dashboard/MetricNav'
import { DataSync } from '@/components/DataSync'
import { HomePage } from '@/pages/HomePage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'

type PageId = 'settings' | 'home' | 'history'
const ORDER: Record<PageId, number> = { history: 0, home: 1, settings: 2 }

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0.6 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0.6 }),
}

export const AppShell = () => {
  const { isLoaded, isSignedIn } = useAuth()

  const [page,      setPage]      = useState<PageId>('home')
  const [direction, setDirection] = useState(0)
  const [navIdx,    setNavIdx]    = useState(2)

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
  }

  /* idx 0 → history, idx 4 → settings, 1-3 → change metric */
  const handleNavSelect = (idx: number) => {
    if (idx === 0) { goTo('history');  return }
    if (idx === 4) { goTo('settings'); return }
    setNavIdx(idx)
  }

  const checkSwipe = (dx: number, dy: number) => {
    if (Math.abs(dx) < Math.abs(dy) * 1.2 || Math.abs(dx) < 65) return
    if (dx > 0) { // swipe right → history
      if (page === 'settings') goTo('home')
      else if (page === 'home') goTo('history')
    } else {      // swipe left → settings
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
  const onMouseDown = (e: React.MouseEvent) => { mouseStart.current = { x: e.clientX, y: e.clientY } }
  const onMouseUp   = (e: React.MouseEvent) => {
    if (!mouseStart.current) return
    checkSwipe(e.clientX - mouseStart.current.x, e.clientY - mouseStart.current.y)
    mouseStart.current = null
  }

  return (
    <>
    <DataSync />
    <div
      className="fixed inset-0 bg-bg overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {/* Sliding pages */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', ease: [0.32, 0, 0.67, 0], duration: 0.26 }}
          className="absolute inset-0 overflow-y-auto overscroll-none scrollbar-hide"
        >
          <div className={cn('min-h-full max-w-[430px] mx-auto px-4 pt-4', page === 'home' ? 'pb-44' : 'pb-8')}>
            {page === 'home'     && <HomePage navIdx={navIdx} />}
            {page === 'history'  && <HistoryPage />}
            {page === 'settings' && <SettingsPage />}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* MetricNav — rendered outside the page slider so it can animate independently */}
      <AnimatePresence>
        {page === 'home' && (
          <MetricNav key="metric-nav" activeIdx={navIdx} onSelect={handleNavSelect} />
        )}
      </AnimatePresence>
    </div>
    </>
  )
}
