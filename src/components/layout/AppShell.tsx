import { useRef, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { MetricNav } from '@/components/features/dashboard/MetricNav'
import { DataSync } from '@/components/DataSync'
import { HomePage } from '@/pages/HomePage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { getSettings } from '@/services/foodRecognitionApi'

type PageId = 'settings' | 'home' | 'history'
const ORDER: Record<PageId, number> = { history: 0, home: 1, settings: 2 }

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0.6 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0.6 }),
}

const Spinner = () => (
  <div className="fixed inset-0 bg-bg flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-ink/20 border-t-ink rounded-full animate-spin" />
  </div>
)

export const AppShell = () => {
  const { isLoaded, isSignedIn, user } = useAuth()
  const { isConfigured } = useSettingsStore()

  const { setShowManualEntry, setShowFoodLibrary, setPrefillEntry } = useUIStore()

  const [page,      setPage]      = useState<PageId>('home')
  const [direction, setDirection] = useState(0)
  const [navIdx,    setNavIdx]    = useState(2)
  const [pageReady, setPageReady] = useState(false)

  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const mouseStart = useRef<{ x: number; y: number } | null>(null)

  // On first sign-in: check if user has saved settings.
  // Check local isConfigured first; fall back to a backend query.
  useEffect(() => {
    if (!user?.id) return
    if (isConfigured) { setPageReady(true); return }
    getSettings()
      .then((settings) => {
        if (settings) {
          useSettingsStore.getState().setSettings(settings)
        } else {
          setPage('settings')
        }
      })
      .catch((e) => console.error('[AppShell settings]', e))
      .finally(() => setPageReady(true))
  }, [user?.id])

  if (!isLoaded) return <Spinner />
  if (!isSignedIn) return <Navigate to="/login" replace />
  if (!pageReady) return <Spinner />

  const goTo = (to: PageId) => {
    if (to === page) return
    setDirection(ORDER[to] > ORDER[page] ? 1 : -1)
    setPage(to)
  }

  /* idx 0 → manual entry, idx 4 → food library, 1-3 → change metric */
  const handleNavSelect = (idx: number) => {
    if (idx === 0) { setPrefillEntry(null); setShowManualEntry(true); return }
    if (idx === 4) { setShowFoodLibrary(true);                        return }
    setNavIdx(idx)
  }

  const checkSwipe = (dx: number, dy: number) => {
    if (Math.abs(dx) < Math.abs(dy) * 2.5 || Math.abs(dx) < 80) return
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
          className={cn(
            'absolute inset-0 scrollbar-hide',
            page === 'home' ? 'overflow-hidden' : 'overflow-y-auto overscroll-none',
          )}
        >
          <div className={cn(
            'max-w-[430px] mx-auto px-4 pt-4',
            page === 'home' ? 'h-full' : 'min-h-full pb-8',
          )}>
            {page === 'home'     && <HomePage navIdx={navIdx} />}
            {page === 'history'  && <HistoryPage />}
            {page === 'settings' && <SettingsPage onSaved={() => goTo('home')} />}
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
